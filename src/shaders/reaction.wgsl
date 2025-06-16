// --- Constants ---
const INTERNAL_NODE_NUMBER : u32 = 7u; // Max index for internal nodes is 6 (0..6)
const LEAF_NODE_NUMBER : u32 = 8u;     // Max index for leaf node (0..8), matching 2*6 + 2
const RESULTS_ARRAY_SIZE : u32 = LEAF_NODE_NUMBER + INTERNAL_NODE_NUMBER + 1u; // Array holds nodes 0..6 (internal) and 7..15 (leaves 0..8 mapped)

// Bits/Masks for condition_data (Packed modes for nodes 0-6)
const mode_bits : u32 = 2u;
const mode_mask : u32 = 3u; // (1u << mode_bits) - 1u

// Bits/Masks for unpacking data
const pos_bits : u32 = 3u;
const pos_mask : u32 = 7u; // (1u << pos_bits) - 1u
const tile_bits : u32 = 5u;
const tile_mask : u32 = 31u; // (1u << tile_bits) - 1u
const bias_bits : u32 = 5u;
const bias_mask : u32 = 31u; // (1u << bias_bits) - 1u

// Bits per leaf rule within a packed u32
const rule_bits_per_leaf : u32 = 1u + pos_bits + tile_bits; // magnitude_bit + pos_index + tile_type

// Workgroup and Cache Dimensions
const workgroup_size_x = 8u;
const workgroup_size_y = 8u;
const max_offset = 2u; // Max check distance (scale = 1 or 2)
const cache_offset = max_offset; // Padding border size = 2
const cache_dim_x = workgroup_size_x + 2u * cache_offset; // 8 + 2*2 = 12
const cache_dim_y = workgroup_size_y + 2u * cache_offset; // 8 + 2*2 = 12

// Direction offsets (N, NE, E, SE, S, SW, W, NW)
const directionOffsets = array<vec2i, 8>(
  vec2i(0, 1), vec2i(1, 1), vec2i(1, 0), vec2i(1, -1),
  vec2i(0, -1), vec2i(-1, -1), vec2i(-1, 0), vec2i(-1, 1)
);

// --- Shared Memory ---
// Cache for input texture tiles within the workgroup's neighborhood
// WGSL layout: array<array<type, height>, width>
// Access as tile_cache[x_index][y_index]
var<workgroup> tile_cache: array<array<u32, cache_dim_y>, cache_dim_x>;

// --- Bindings ---
@group(0) @binding(0) var input_tex: texture_storage_2d<r32uint, read>;
@group(0) @binding(1) var output_tex: texture_storage_2d<r32uint, write>;
@group(0) @binding(2) var rules: texture_storage_2d<r32uint, read>;

// --- Helper Function: Evaluate Leaf Condition (Reads from Cache) ---
fn evaluate_leaf_condition(
    center_pos_local: vec2u,       // Center pixel's position within the 8x8 workgroup (local_id.xy)
    packed_rule_data_chunk: u32,   // The relevant u32 chunk pre-fetched from 'rules'
    leaf_index_in_chunk: u32,      // Index within the chunk (0, 1, or 2)
    symmetry: u32                  // Symmetry index 0..7
) -> bool {
    // --- Extract data for this specific leaf from the packed chunk ---
    let bit_offset = leaf_index_in_chunk * rule_bits_per_leaf;
    var rule_data = packed_rule_data_chunk >> bit_offset;

    let magnitude_bit = rule_data & 1u;
    rule_data = rule_data >> 1u;

    let pos_index_base = rule_data & pos_mask;
    rule_data = rule_data >> pos_bits;

    let tile_type_to_match = rule_data & tile_mask;

    // --- Apply Symmetry ---
    // Rotation: number of 45 degree rotations = (symmetry / 2) * 2
    let rotation = (symmetry >> 1u) << 1u;
    let pos_index = (pos_index_base + rotation) & 7u; // Use & 7u instead of % 8u

    // Flip: -1 if symmetry is odd, +1 otherwise
    let flip : i32 = select(1, -1, (symmetry & 1u) != 0u); // select(if_false, if_true, condition)
    let scale : i32 = i32(1u + magnitude_bit); // Distance 1 or 2

    let base_dir = directionOffsets[pos_index];
    let rel_pos : vec2i = scale * flip * base_dir; // Relative offset to check

    // --- Calculate position to check WITHIN THE CACHE ---
    // Map the relative offset 'rel_pos' to the shared memory cache coordinates.
    // The workgroup's (0,0) maps to (cache_offset, cache_offset) in the cache.
    let cache_check_pos_signed = vec2i(center_pos_local + cache_offset) + rel_pos;

    // Note: No wrap-around needed here because the cache loading already handled it.
    // We rely on cache_dim being large enough to contain all valid accesses.
    // Add bounds checks only if debugging potential cache access errors.
    // if (cache_check_pos_signed.x < 0 || cache_check_pos_signed.x >= i32(cache_dim_x) || ...)

    let cache_check_pos = vec2u(cache_check_pos_signed);

    // *** Read from shared memory cache ***
    let neighbour_tile_type = tile_cache[cache_check_pos.x][cache_check_pos.y]; // Access [x][y]

    return neighbour_tile_type == tile_type_to_match;
}


// --- Helper Function: Evaluate Condition Tree (Uses Pre-fetched Rules) ---
fn evaluate_tree_for_symmetry(
    center_pos_local: vec2u,    // Center pixel's local workgroup coordinate
    tile_index: u32,            // Base index for rules texture lookup
    reaction_index: u32,
    condition_index: u32,
    condition_modes_packed: u32, // Packed modes for internal nodes 0-6
    symmetry: u32               // Symmetry index 0..7
) -> bool {
    // Array to store results for each node (internal 0..6, leaves 0..8 map to 7..15)
    var node_results: array<bool, RESULTS_ARRAY_SIZE>;

    // --- Pre-fetch Rule Data Chunks for Leaves 0..8 ---
    let rule_base_y = reaction_index * 16u + condition_index;
    // Calculate X coords for the 3 potential u32s holding leaf data
    let rule_chunk_x012 = tile_index + 1u; // For leaves 0, 1, 2 (index / 3 = 0)
    let rule_chunk_x345 = tile_index + 2u; // For leaves 3, 4, 5 (index / 3 = 1)
    let rule_chunk_x678 = tile_index + 3u; // For leaves 6, 7, 8 (index / 3 = 2)

    // Load the 3 chunks containing all leaf rule data for this condition/tile/reaction
    // Bounds checking for textureLoad might be needed if indices can go out of bounds
    let packed_rules_012 = textureLoad(rules, vec2u(rule_chunk_x012, rule_base_y)).r;
    let packed_rules_345 = textureLoad(rules, vec2u(rule_chunk_x345, rule_base_y)).r;
    let packed_rules_678 = textureLoad(rules, vec2u(rule_chunk_x678, rule_base_y)).r;

    // Store chunks for easy access during leaf evaluation
    let rule_chunks = array<u32, 3>(packed_rules_012, packed_rules_345, packed_rules_678);

    // --- Step 1: Evaluate all potential leaf nodes (indices 0..LEAF_NODE_NUMBER) ---
    // Store results in node_results array starting at index INTERNAL_NODE_NUMBER (7)
    for (var i: u32 = 0u; i <= LEAF_NODE_NUMBER; i = i + 1u) {
        let chunk_index = i / 3u;           // Which chunk (0, 1, or 2)
        let index_in_chunk = i % 3u;        // Position within chunk (0, 1, or 2)
        let result_index = i + INTERNAL_NODE_NUMBER; // Map leaf index 0..8 to array index 7..15
        

        node_results[result_index] = evaluate_leaf_condition(
            center_pos_local,       // Pass local coordinate
            rule_chunks[chunk_index], // Pass the correct pre-fetched chunk
            index_in_chunk,         // Pass the index within that chunk
            symmetry
        );
    }

    // --- Step 2: Evaluate internal nodes (indices 6 down to 0) ---
    // Iterate 7 times for nodes 6, 5, ..., 0
    for (var iter: u32 = 0u; iter < INTERNAL_NODE_NUMBER; iter = iter + 1u) {
        let node_idx = (INTERNAL_NODE_NUMBER - 1u) - iter; // Current internal node index (6, 5..0)

        // Extract mode for this internal node
        let mode = (condition_modes_packed >> (node_idx * mode_bits)) & mode_mask;

        // Children indices in the node_results array (1-based tree -> 0-based array)
        // Child 1: 2*node_idx + 1
        // Child 2: 2*node_idx + 2
        let child1_result_idx = 2u * node_idx + 1u;
        let child2_result_idx = child1_result_idx + 1u;

        let child1_result = node_results[child1_result_idx];
        let child2_result = node_results[child2_result_idx];

        // Combine child results based on the mode
        switch(mode) {
            case 0u: { node_results[node_idx] = child1_result && child2_result; } // AND
            case 1u: { node_results[node_idx] = child1_result || child2_result; } // OR
            case 2u: { node_results[node_idx] = !(child1_result || child2_result); } // NOR
            case 3u: { node_results[node_idx] = !(child1_result && child2_result); } // NAND
            default: { node_results[node_idx] = false; } // Should not happen
        }
    } // End internal node evaluation

    // --- Step 3: The final result for this symmetry is at the root node (index 0) ---
    return node_results[0];
}


// --- Helper Function: Check All Symmetries for a Condition ---
fn check_conditions(
    center_pos_local: vec2u,    // Center pixel's local workgroup coordinate
    tile_index: u32,            // Base index for rules texture lookup
    reaction_index: u32,
    condition_index: u32,
    condition_modes_packed: u32 // Packed modes for internal nodes 0-6
) -> bool {
    var overall_result : bool = false;

    // Loop through all 8 symmetries (0 to 7)
    for (var sym : u32 = 0u; sym < 8u; sym = sym + 1u) {
        let result_for_symmetry = evaluate_tree_for_symmetry(
            center_pos_local, // Pass local pos
            tile_index,
            reaction_index,
            condition_index,
            condition_modes_packed,
            sym // Pass the current symmetry index
        );
        overall_result = overall_result || result_for_symmetry;

        // Early exit if any symmetry evaluates to true
        if (overall_result) {
            break;
        }
    }
    return overall_result;
}


// --- Main Compute Shader Entry Point ---
@compute @workgroup_size(workgroup_size_x, workgroup_size_y)
fn main(
    @builtin(local_invocation_id) local_id : vec3<u32>,     // Thread ID within workgroup (0..7, 0..7)
    @builtin(workgroup_id) workgroup_id : vec3<u32>,     // ID of this workgroup
    @builtin(global_invocation_id) global_id : vec3<u32>   // Global pixel coordinate
) {
    let tex_dims = vec2i(textureDimensions(input_tex));

    // --- Phase 1: Load Input Tiles into Shared Memory Cache ---
    // Calculate the top-left corner (global coords) of the region this workgroup needs to cache
    let cache_global_origin_x = i32(workgroup_id.x * workgroup_size_x) - i32(cache_offset);
    let cache_global_origin_y = i32(workgroup_id.y * workgroup_size_y) - i32(cache_offset);

    // Determine how many pixels each thread needs to load to fill the cache
    let num_cache_pixels = cache_dim_x * cache_dim_y;
    let num_threads = workgroup_size_x * workgroup_size_y;
    let num_loads_per_thread = (num_cache_pixels + num_threads - 1u) / num_threads; // Ceiling division

    let thread_index_1d = local_id.y * workgroup_size_x + local_id.x; // Flattened thread index (0..63)

    // Each thread loads its portion(s)
    for (var i: u32 = 0u; i < num_loads_per_thread; i = i + 1u) {
        let linear_cache_index = thread_index_1d + i * num_threads;

        // Check if this index is within the cache bounds
        if (linear_cache_index < num_cache_pixels) {
            // Convert linear cache index back to 2D cache coordinates
            let cache_x = linear_cache_index % cache_dim_x;
            let cache_y = linear_cache_index / cache_dim_x; // Check order if issues arise

            // Calculate the global coordinate to load FROM, handling torus wrap-around
            let global_load_x_signed = cache_global_origin_x + i32(cache_x);
            let global_load_y_signed = cache_global_origin_y + i32(cache_y);

            // Apply wrap-around logic
            let global_load_x = u32((global_load_x_signed % tex_dims.x + tex_dims.x) % tex_dims.x);
            let global_load_y = u32((global_load_y_signed % tex_dims.y + tex_dims.y) % tex_dims.y);

            // Load from global texture memory into shared memory cache
            tile_cache[cache_x][cache_y] = textureLoad(input_tex, vec2u(global_load_x, global_load_y)).x;
        }
    }

    // --- Synchronize ---
    // Ensure all threads have finished loading the cache before any thread proceeds to read from it.
    workgroupBarrier();

    // --- Phase 2: Main Logic (Using Cached Input Tiles) ---
    // Get the center tile type for *this specific thread* from the cache
    // Its position in the cache is its local_id offset by the cache border size
    let center_cache_pos = local_id.xy + cache_offset;
    let tile_type = tile_cache[center_cache_pos.x][center_cache_pos.y];

    // Calculate the base index for looking up rules for this tile type
    let tile_index = tile_type * 4u; // Assuming 4 u32s horizontal space per tile type in rules texture base

    var max_tile = tile_type; // Start with current tile as default result
    var max_value : i32 = i32(0u); // Give default result a value of 0

    // Iterate through all possible reactions for this tile type
    for (var reaction_index = 0u; reaction_index < 8u; reaction_index = reaction_index + 1u) {
        // Load base data for this reaction (result tile, base bias)
        // This still reads from the global 'rules' texture once per reaction
        let reaction_base_y = reaction_index * 16u; // Base Y coord for this reaction's data
        var reaction_data = textureLoad(rules, vec2u(tile_index, reaction_base_y)).r;

        let reaction_result_tile = reaction_data & tile_mask;
        reaction_data = reaction_data >> tile_bits;

        // Calculate reaction bias (signed value centered around 0)
        let reaction_bias = i32(reaction_data & bias_mask) - i32(1u << (bias_bits - 1u));
        var reaction_value : i32 = reaction_bias; // Start total value with bias

        // Iterate through all conditions for this reaction
        for (var condition_index = 0u; condition_index < 16u; condition_index = condition_index + 1u) {
            // Load base data for this condition (value, packed modes)
            // This still reads from 'rules' once per condition
            let condition_base_y = reaction_base_y + condition_index; // Y coord for this condition
            // Need to read from tile_index + 0 for value/modes
            var condition_base_data = textureLoad(rules, vec2u(tile_index, condition_base_y)).r;

            // Shift *past* result_tile and reaction_bias bits stored at (tile_index, reaction_base_y)
            condition_base_data = condition_base_data >> (tile_bits + bias_bits);

            let condition_value_unsigned = condition_base_data & bias_mask; // Condition's contribution value (unsigned)
            let condition_modes_packed = condition_base_data >> bias_bits;  // Packed modes for this condition's tree

            // Check if the condition tree evaluates to true using cached neighbours
            if (check_conditions(local_id.xy, tile_index, reaction_index, condition_index, condition_modes_packed)) {
                // If condition met, add its value to the reaction's total value
                reaction_value = reaction_value + (i32(condition_value_unsigned) - i32(1u << (bias_bits - 1u)));
            }
        } // End condition loop

        // After checking all conditions, see if this reaction has the highest value so far
        if (reaction_value > max_value) {
            max_value = reaction_value;
            max_tile = reaction_result_tile;
        }
    } // End reaction loop

    // --- Phase 3: Write Output ---
    // Write the winning tile type to the output texture at the global position
    textureStore(output_tex, global_id.xy, vec4(max_tile, 0u, 0u, 0u));
}
function setArray2DRange(target:Uint32Array, targetWidth:number, targetHeight:number, data:Uint32Array, dataOffsetX:number, dataOffsetY:number, dataWidth:number, dataHeight:number){
    if (dataWidth + dataOffsetX > targetWidth || dataHeight + dataOffsetY > targetHeight){
        throw new Error("2D Range out of Bounds")
    }
    if (target.length != targetWidth * targetHeight || data.length != dataWidth * dataHeight){
        throw new Error("Data length does not match data width * data height")
    }
    for(var i=0; i<dataHeight; i++){
        target.set(data.slice(i*dataWidth, (i+1)*dataWidth), (i + dataOffsetY) * targetWidth + dataOffsetX)
    }
}

// --- Constants for Default Rule Initialization ---
// Packed leaf: tile=31, dir=0, dist=1 => 496
const DEFAULT_LEAF_VALUE = 496;
// Pack 3 default leaves into one u32 (LSB first)
const DEFAULT_LEAF_PACKED = (DEFAULT_LEAF_VALUE << 18) | (DEFAULT_LEAF_VALUE << 9) | DEFAULT_LEAF_VALUE; // = 130277872

// Packed base data for condition_index > 0 at x=0: modes=0, value=0 (stored biased=16)
// (modes=0 << 15) | (biased_value=16 << 10) = 16384
const DEFAULT_X0_COND_GT0 = 16384;

// Packed base data for condition_index = 0 at x=0 (excluding result_tile): modes=0, value=0 (biased=16), bias=-16 (biased=0)
// (modes=0 << 15) | (biased_value=16 << 10) | (biased_bias=0 << 5) = 16384
const DEFAULT_X0_COND0_BASE = 16384;

const MAX_TILE_TYPES = 32; // Based on 5 bits
const MAX_REACTIONS_PER_TYPE = 8;
const MAX_CONDITIONS_PER_REACTION = 16;
const RULE_TEXTURE_WIDTH = 128;
const RULE_TEXTURE_HEIGHT = 128; // Or calculate based on max types/reactions/conditions if smaller

export class Rules{
    data: Uint32Array;
    reaction_tracker: number[];
    width: number;
    height: number;

    constructor(){
        this.width = RULE_TEXTURE_WIDTH;
        this.height = RULE_TEXTURE_HEIGHT;
        this.data = new Uint32Array(this.width * this.height);
        this.reaction_tracker = new Array(MAX_TILE_TYPES).fill(0);

        // --- Initialize with "Do Nothing" Reactions ---
        for (let tile_type = 0; tile_type < MAX_TILE_TYPES; tile_type++) {
            const default_x0_cond0 = DEFAULT_X0_COND0_BASE | (tile_type & 0b11111); // Add result_tile

            for (let reaction_idx = 0; reaction_idx < MAX_REACTIONS_PER_TYPE; reaction_idx++) {
                for (let condition_idx = 0; condition_idx < MAX_CONDITIONS_PER_REACTION; condition_idx++) {
                    const baseX = tile_type * 4;
                    const baseY = reaction_idx * 16 + condition_idx;

                    // Check bounds before writing (optional but safe)
                    if (baseX + 3 >= this.width || baseY >= this.height) {
                        console.warn(`Skipping default rule init at [${baseX}, ${baseY}] for tile ${tile_type} - out of bounds`);
                        continue; // Prevent writing out of bounds
                    }

                    const flatBaseIndex = baseY * this.width + baseX;

                    // Set x=0 data (modes, value, bias, result_tile)
                    this.data[flatBaseIndex] = (condition_idx === 0) ? default_x0_cond0 : DEFAULT_X0_COND_GT0;

                    // Set x=1, x=2, x=3 data (packed leaves)
                    this.data[flatBaseIndex + 1] = DEFAULT_LEAF_PACKED;
                    this.data[flatBaseIndex + 2] = DEFAULT_LEAF_PACKED;
                    this.data[flatBaseIndex + 3] = DEFAULT_LEAF_PACKED;
                }
            }
        }
        // --- End Initialization ---
    }

    /**
     * add_reaction - Overwrites the default rules for the specified slot
     */
    public add_reaction(tile_type:number, reaction:Reaction) {
        if (tile_type >= MAX_TILE_TYPES) {
             throw new Error("Tile type out of range: " + tile_type);
        }
        let index = this.reaction_tracker[tile_type];
        if (index >= MAX_REACTIONS_PER_TYPE){
            throw new Error("Too many reactions for tile type "+ tile_type);
        }
        // Calculate offset and check bounds before writing
        const dataOffsetX = tile_type * 4;
        const dataOffsetY = index * 16;
         if (dataOffsetX + 4 > this.width || dataOffsetY + 16 > this.height) {
             throw new Error(`Reaction data for tile ${tile_type}, reaction ${index} would be out of bounds.`);
         }

        setArray2DRange(this.data, this.width, this.height, reaction.getData(), dataOffsetX, dataOffsetY, 4, 16);
        this.reaction_tracker[tile_type] += 1;
        return this;
    }
    public getData(){
        return this.data;
    }
}

export class Reaction {
    data: Uint32Array;
    condition_number: number; // Tracks how many conditions were *actually* added
    // Store original constructor args for reference if needed, though not strictly required
    // for the data generation itself after initialization.
    private initial_result_tile: number;
    private initial_bias: number;

    constructor(resultTile: number | Tile, bias: number) {
        this.data = new Uint32Array(4 * MAX_CONDITIONS_PER_REACTION); // 4 wide, 16 tall buffer
        this.condition_number = 0; // No conditions explicitly added yet
        this.initial_result_tile = Number(resultTile);
        this.initial_bias = bias;

        // --- Initialize Reaction data with Defaults ---
        // These defaults represent the reaction's base behavior + conditions that always evaluate to false.

        // Calculate biased representation for the reaction's base bias
        const biased_bias = (this.initial_bias + 16) & 0b11111; // 5 bits
        const result_tile_masked = this.initial_result_tile & 0b11111; // 5 bits

        // Default values for the condition part (value=0, modes=0 -> AND tree)
        const default_biased_value = (0 + 16) & 0b11111; // value=0 stored biased
        const default_modes = 0; // modes=0 (AND)

        // Packed base data for condition_index = 0 at x=0
        // Combines reaction's bias/result with default condition value/modes
        // Format: (modes << 15) | (value << 10) | (bias << 5) | result_tile
        const default_x0_cond0 = (default_modes << 15) | (default_biased_value << 10) | (biased_bias << 5) | result_tile_masked;

        // Packed base data for condition_index > 0 at x=0
        // Uses default condition value/modes (reaction bias/result only apply to index 0)
        // Format: (modes << 15) | (value << 10) | (zeros << 5) | zeros
        const default_x0_cond_gt0 = (default_modes << 15) | (default_biased_value << 10);

        // Loop through all 16 possible condition slots in this reaction block
        for (let condition_idx = 0; condition_idx < MAX_CONDITIONS_PER_REACTION; condition_idx++) {
            const baseIndex = condition_idx * 4; // Start index for this row (width=4)

            // --- Fill the data buffer with default values ---

            // Set x=0 data (modes, value, bias, result_tile)
            this.data[baseIndex + 0] = (condition_idx === 0) ? default_x0_cond0 : default_x0_cond_gt0;

            // Set x=1, x=2, x=3 data (packed default "always false" leaves)
            this.data[baseIndex + 1] = DEFAULT_LEAF_PACKED;
            this.data[baseIndex + 2] = DEFAULT_LEAF_PACKED;
            this.data[baseIndex + 3] = DEFAULT_LEAF_PACKED;
        }
        // --- End Initialization ---
        // Now, this.data contains a fully formed reaction block where all
        // 16 conditions are the default "always false" ones, but the base
        // reaction bias and result tile are correctly set at condition_index 0.
    }

    /**
     * Adds a specific condition, overwriting the default values for that condition slot.
     */
    public add_condition(condition: Condition, value: number) {
        if (this.condition_number >= MAX_CONDITIONS_PER_REACTION) {
            throw new Error("Too many conditions added to this reaction.");
        }
        const condData = datifyConditionTree(condition, value); // Get the 4 u32s from the Condition object

        // --- Overwrite the default data for this specific condition number ---
        const baseIndex = this.condition_number * 4; // Start index for the row to overwrite

        // Copy the real condition data (all 4 u32s) into the reaction's buffer
        this.data.set(condData, baseIndex);

        // --- Special handling for x=0 element ---
        // We need to combine the reaction's base bias/result tile with the *first*
        // added condition's value/modes. For subsequent conditions, we just need
        // to apply the << 10 shift.

        let targetIndexX0 = baseIndex; // Index of the x=0 element we just overwrote

        if (this.condition_number == 0) {
            // This is the FIRST condition being added.
            // this.data[targetIndexX0] currently holds (modes << 5) | biased_value from condData[0]
            let originalCondData0 = this.data[targetIndexX0];
            // Recalculate biased bias and masked result tile from initial values
            const biased_bias = (this.initial_bias + 16) & 0b11111;
            const result_tile_masked = this.initial_result_tile & 0b11111;
            // Re-pack: Shift condition's value/modes left, OR in reaction's bias/result
            this.data[targetIndexX0] = (originalCondData0 << 10) | (biased_bias << 5) | result_tile_masked;
        } else {
            // This is NOT the first condition (index > 0).
            // Just shift the value/modes data (already copied from condData[0]) left by 10 bits.
            this.data[targetIndexX0] = this.data[targetIndexX0] << 10;
        }

        this.condition_number += 1; // Increment the count of *explicitly added* conditions
        return this; // Allow chaining
    }

    /**
     * Returns the internal data buffer containing reaction info + all condition data
     * (either explicitly added or the constructor defaults).
     */
    public getData() {
        return this.data;
    }
}

function datifyConditionTree(conditionTree:Condition, value: number){
    var nodes = [conditionTree];
    var tileData = []; // Stores the packed data for LEAF nodes 0-8
    var conditionTypes = 0; // Packed modes for INTERNAL nodes 0-6

   

    // Build the tree level by level up to node 6 (7 internal nodes)
    for(var i = 0; i < 7; i++){ // Loop for internal nodes 0..6
        let node = nodes[i]; // Get the node to process for this level

        if (node instanceof COperator){
            // Add operator's mode, push children for next level
            conditionTypes = conditionTypes | ((node.getType() & 0b11) << 2 * i);
            nodes.push(node.first, node.second);
        }
        else if (node instanceof TileAt){
                // Reached a leaf before depth 3. Treat as And(node, node) = node
            conditionTypes = conditionTypes | (0b01 << 2 * i); // And mode
            nodes.push(node, node); // Duplicate the node as both children
        }
        else {
            // Should not happen with current CNode types
            throw new Error("Unexpected node type during condition tree processing.");
        }
    }

    // Now, collect the leaf data for nodes at indices 7 through 14 (leaves 0-7)
    // The loop below generates 8 leaves (indices 7-14 in nodes array).
    for(var i = 7; i < nodes.length && tileData.length < 8; i++){ // Process nodes intended as leaves
            let node = nodes[i];
            if (node instanceof TileAt){
                tileData.push(node.getData());
            } else {
                // If an operator ends up here, the tree might be too deep or ill-formed.
                // Push a default "false" leaf.
                console.warn("Operator found at leaf level, tree structure might be wrong. Using default leaf.");
                tileData.push(DEFAULT_LEAF_VALUE);
            }
    }
    // Ensure exactly 8 leaves are in tileData, padding if necessary
    while(tileData.length < 8) {
        tileData.push(DEFAULT_LEAF_VALUE);
    }

    let data = new Uint32Array(4)

    data[0] = (conditionTypes<<5) | ((value +16) & 0b11111)
    for (var i = 0; i < tileData.length; i++) { // Should loop 8 times for leaves 0-7
        let dataIndex = 1 + Math.floor(i / 3); // Target element: 1, 2, or 3
        let indexInChunk = i % 3;              // Index within the chunk: 0, 1, or 2
        let bitOffset = indexInChunk * 9;      // Offset: 0, 9, or 18 (Shader expects LSB first)
    
        let leafData = tileData[i] & 0b111111111; // Mask the 9-bit leaf data
    
        // Shift the NEW leaf data to its correct position and OR it in
        data[dataIndex] = data[dataIndex] | (leafData << bitOffset);
    }
    return data
}

class Condition{
    
}

class COperator extends Condition{
    type: number
    first: Condition
    second: Condition
    constructor(first:Condition, second:Condition, type:number){
        super()
        this.first = first
        this.second = second
        this.type = type
    }
    public getType(){
        return this.type
    }
}

class AndNode extends COperator{
    constructor(first: Condition, second: Condition){
        super(first, second, 0)
    }
    
}
class OrNode extends COperator{
    constructor(first: Condition, second: Condition){
        super(first, second, 1)
    }
    
}
class NorNode extends COperator{
    constructor(first: Condition, second: Condition){
        super(first, second, 2)
    }
    
}

class NandNode extends COperator{
    constructor(first: Condition, second: Condition){
        super(first, second, 3)
    }
    
}
class TileAt extends Condition {
    Data: number;
    constructor(tile: number | Tile, direction: number | Dir, distance: number) {
        super();
        // Ensure distance is 1 or 2 for magnitude bit
        let magnitude_bit = (distance === 2) ? 1 : 0;
        // Ensure direction and tile are within bit limits
        let pos_index_base = Number(direction) & 0b111; // 3 bits
        let tile_type = Number(tile) & 0b11111;      // 5 bits

        // Pack: tile | direction | magnitude (LSB)
        this.Data = (tile_type << 4) | (pos_index_base << 1) | magnitude_bit;
        // Packed format: TTTTTDDD M (9 bits total)
    }
    public getData() {
        return this.Data;
    }
}

export enum Tile{
    VOID = 0,
    WATER = 1,
    LAVA = 2,
    MAGIC = 3,
    GRASS = 4,
    MUD = 5
}

export enum Dir{
    N = 0,
    NE = 1,
    E = 2,
    SE = 3,
    S = 4,
    SW = 5,
    W = 6,
    NW = 7
}

export function and(...elements){
    if (elements.length < 1){
        throw new Error("Cannot take the and of nothing.")
    }
    if (elements.length == 1){
        return elements[0]
    }
    let halfIndex = Math.floor(elements.length/2)
    return new AndNode(and(...elements.slice(0, halfIndex)), and(...elements.slice(halfIndex, elements.length)))
}

export function or(...elements){
    if (elements.length < 1){
        throw new Error("Cannot take the or of nothing.")
    }
    if (elements.length == 1){
        return elements[0]
    }
    let halfIndex = Math.floor(elements.length/2)
    return new OrNode(or(...elements.slice(0, halfIndex)), or(...elements.slice(halfIndex, elements.length)))
}

export function not(element:Condition){
    var type
    if (element instanceof COperator){
        switch (element.type){
            case 0:
                type = NandNode
                break
            case 1:
                type = NorNode
                break
            case 2:
                type = OrNode
                break
            case 3:
                type = AndNode
                break
            default:
                throw Error("Coperator with weird type")
        }
        return new type(element.first, element.second)
    }
    else if (element instanceof TileAt){
        return new NandNode(element, element)
    }
}

export function tileAt(tile: number | Tile, direction: number | Dir, distance: number = 1){
    return new TileAt(tile, direction, distance)
}
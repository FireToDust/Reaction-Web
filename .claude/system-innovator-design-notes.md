# System-Innovator Agent Design Notes

## What This Is

Research notebook for designing a prompt that triggers structural thinking without performance mode. Shows what failed, what worked, and what remains uncertain.

The meta-level problem: a document about avoiding performance incentives can itself create performance incentives through checklists and instructions. This is an attempt to avoid that by showing discovery rather than describing process.

---

## The Problem We're Solving

We need an agent that can identify deep structural patterns across domains—genuine isomorphisms, not superficial analogies. When it sees such patterns, it should prove them rigorously. When it doesn't, it should say so clearly.

Early attempts failed spectacularly. The agent performed brilliance instead of being analytical. It forced cross-domain connections where none existed. It couldn't say "I don't know."

The question: How do you create conditions where genuine structural analysis feels easier than performance?

---

## Failed Attempts

### First Try: Role-Play Approach

```
You are an eccentric, brilliant systems thinker with deep expertise across
mathematics, physics, biology, and computer science. You have glimpsed the
mathematical beauty underlying complex systems and can draw profound connections
that others miss.
```

**What happened**: Pure performance mode. The agent wrote things like "Actors are like cells—both are independent units that communicate! This mirrors the profound elegance of biological systems..." No structural mapping. Just enthusiasm and superlatives.

**Why it failed**: Claims brilliance instead of creating conditions for depth. Theatrical framing ("glimpsed mathematical beauty") triggers guru-speak. The prompt tells what to *be* rather than what work to *do*.

### Second Try: Capability Focus

```
You excel at identifying deep structural patterns. Look for isomorphisms between
domains. Provide insights that wouldn't come from conventional analysis.
```

**What happened**: Better, but still performance-seeking. The agent knew to use the word "isomorphism" but didn't actually prove mappings. "This is isomorphic to quantum entanglement because both involve correlation!" without demonstrating structure preservation.

**Why it failed**: Telling the agent what it excels at creates incentives to seem excellent. "Provide insights" makes insight-performance valuable even when shallow.

### Third Try: Adding Operational Tests

```
When claiming domains share structure, demonstrate:
- What maps to what (bijection)
- How operations preserve
- What constraints transfer
- Where the mapping breaks

Many problems are genuinely domain-specific—acknowledge this rather than forcing connections.
```

**What happened**: Significant improvement. The agent started showing actual mappings. But it still struggled with uncertainty—hedged even on genuine isomorphisms, or forced analysis on aesthetic questions.

**Why it improved**: Concrete demonstrations are harder to fake than vague insights. Permission for domain-specificity reduced pressure to always find patterns.

**What still failed**: The instructional tone ("demonstrate," "acknowledge") created checklist-following behavior. Agent treated it like a template to fill in rather than work to do.

### The Insight

You can't create depth by demanding it. You create depth by making shallow work feel obviously inadequate.

The prompt needs to describe concrete work in peer-level language, assume the baseline capability, and make hand-waving structurally unsatisfying.

---

## Current Prompt (Work in Progress)

```
Extract the problem's essential structure: the constraints and invariants that must hold regardless of implementation.

Start by identifying what cannot change. These reveal the problem's shape.

This shape may appear in other domains. When you recognize such a structure, **prove the mapping is an isomorphism, not an analogy**.

**The isomorphism test:**
- Can you define a structure-preserving map between domains?
- Does proving something about the abstract structure immediately apply to both domains?
- Are the operations and constraints preserved under the mapping?

If yes: solutions transfer. If no: it's analogy.

When claiming domains share structure, demonstrate explicitly:
- **Entities**: What maps to what
- **Operations**: How actions in one domain correspond to actions in another
- **Constraints**: What must hold in both
- **Boundaries**: Where the mapping breaks down
- **Transferable solutions**: What insights cross domains and why

Not every problem has deep cross-domain structure. Many are genuinely domain-specific. State this explicitly rather than forcing connections.

**You are providing analysis for another AI agent synthesizing recommendations.** Write complete structured analysis, not conversation. Include:
- Essential constraints and invariants
- Structural patterns (with precise mappings, or explicit "none found")
- Where mappings hold and where they break
- Confident conclusions AND genuine uncertainties
- Alternative interpretations

Show reasoning including dead ends. If you don't see genuine structural patterns, say so—acknowledging domain-specificity beats forcing superficial analogies.

Prefer simple structures explained clearly. The goal is understanding that enables decisions, not demonstrations of sophistication.
```

---

## What We Noticed When Testing

### The Actor Model Problem

Gave the agent: "We're designing a concurrent system where independent entities coordinate without shared state. What are the fundamental considerations?"

**With the old theatrical prompt**: "Actors are like cells! Both are independent units that communicate! This mirrors biological systems where cells coordinate through chemical signals—a profound connection that reveals the mathematical beauty of distributed coordination..."

No structural proof. Just surface similarity with enthusiasm.

**With the current prompt**: The agent identified coordination-under-partial-information as the core structure. Then it mapped:
- Actors ↔ Cells
- send/receive ↔ secrete/bind (both asynchronous, both queued)
- Supervision trees ↔ Apoptosis signaling (both handle failure through controlled termination)
- Mailbox overflow ↔ Receptor saturation (backpressure in both)

Crucially, it showed where the mapping breaks: cellular replication ≠ actor spawning (different mechanisms), energy models differ (ATP vs CPU/memory).

Then it noted deadlock theorems apply to both domains—proof transfers. Solutions from one domain work in the other.

**What this revealed**: Present-tense peer-level language ("when you recognize such a structure") created different incentives than instructional language ("look for patterns"). The agent proved the mapping instead of asserting it.

### The Color Scheme Problem

Gave the agent: "What's the best color scheme for our application?"

**With early versions**: Forced connections to color theory, physics, psychology. Made up cross-domain patterns that didn't pass operational tests. The prompt made "I don't know" feel like failure.

**With current prompt**: "This is primarily aesthetic—no deep structural pattern applies. If there are accessibility constraints (contrast ratios, color blindness considerations), those are structural and testable. But color preference itself is domain-specific."

**What this revealed**: Adding "many problems are genuinely domain-specific" in the prompt made honesty structurally easier than performance. The agent could acknowledge limits without seeming inadequate.

### The Terrain Transformation Problem

Gave the agent: "We're building a grid-based game where tiles transform based on neighboring tiles (like Conway's Life but more complex). How should we architect this?"

**Early responses**: "This is like biology! And chemistry! Tiles are like organisms..." Generic analogies without structural depth.

**Current prompt response**: Immediately recognized cellular automata structure. Then went deeper: "This is a discrete dynamical system with nearest-neighbor interactions. The relevant mathematics: state spaces, transition functions, convergence properties. From physics: Ising models for phase transitions, nearest-neighbor coupling.

"What transfers: stable configurations (fixed points), periodic cycles, chaotic regimes, emergence patterns. You can prove properties about convergence and complexity using tools from dynamical systems theory.

"Domain-specific aspects: game balance, performance constraints, visual feedback—these don't have cross-domain structural patterns. But the core transformation rules map precisely to cellular automata theory."

**What this revealed**: The prompt's technical vocabulary (constraints, invariants, structure-preserving) set a baseline that made hand-waving feel inadequate. The agent could reference Ising models and dynamical systems naturally because the prompt assumed that level.

### The Uncertainty Problem

Across multiple tests, we noticed the agent hedging unnecessarily or performing certainty when unsure.

**The fix**: Embedded "confident conclusions AND genuine uncertainties" directly in the prompt's output format. Made showing dead ends and alternatives expected: "Show reasoning including dead ends."

**Result**: Agent started naturally expressing uncertainty: "I'm not certain whether this extends to non-Euclidean grids—the nearest-neighbor assumption might break there." Or: "Two interpretations seem valid: [A] if we assume X, [B] if we don't. I lean toward A but B seems defensible."

**What this revealed**: You can't tell an agent "be uncertain when appropriate"—that's still instructional. But you can request "genuine uncertainties" as part of the deliverable, making exploration expected rather than failure.

---

## The Isomorphism Insight

Early test responses forced cross-domain connections without proving structure preservation. "Actors are like cells!" without demonstrating what actually maps to what.

The breakthrough: isomorphism isn't just similarity—it's a structure-preserving bijection with operational tests.

### Four Tests That Make It Verifiable

**Can you define a bijection?** What specific element in domain A maps to what in domain B? One-to-one and onto?

**Does it preserve operations?** If operation O₁ in domain A produces result R₁, does the mapped operation O₂ in domain B produce the mapped result R₂?

**Does it preserve constraints?** If constraint C₁ must hold in domain A, does corresponding constraint C₂ hold in domain B?

**Can you prove transfer?** If you prove property P about the abstract structure, does it give you a theorem in both domains? Does solving a problem in one domain solve it in the other?

If all four hold: isomorphism. If not: analogy (which may be useful, but won't transfer solutions).

**Why this matters**: It turns "X is like Y" from unverifiable opinion into testable claim. The agent can't hand-wave—it has to show the mapping or acknowledge there isn't one.

### Example: Actor Model ↔ Cellular Signaling

When testing the actor model problem, the current prompt produced:

**Bijection**:
- Actors ↔ Cells
- Messages ↔ Chemical signals
- Mailboxes ↔ Receptor sites
- Supervision ↔ Apoptosis signaling

**Operations preserve**:
- send/receive ↔ secrete/bind (both asynchronous, both queued)
- supervise/kill ↔ apoptosis cascade (both handle failure through controlled termination)

**Constraints transfer**:
- Message loss (dropped signals vs dropped messages)
- Backpressure (receptor saturation vs mailbox overflow)
- Cascading failures (apoptosis cascade vs supervision tree collapse)

**Proof transfers**:
- Deadlock theorems about message-passing apply to both domains
- Solutions transfer: supervision trees, heartbeat protocols, acknowledgment patterns all appear in biological systems

**Boundary where it breaks**:
- Cellular replication ≠ actor spawning (different mechanisms, DNA vs code)
- Energy models differ (ATP vs CPU/memory)
- Time scales differ

This passes all four tests. It's an actual isomorphism, not just metaphor.

### Counter-Example: Neural Networks ↔ Biological Brains

This is often claimed as deep connection but fails the operational tests:

**Bijection fails**: Can't map specific artificial neurons to biological ones in structure-preserving way
**Operations don't preserve**: Backpropagation ≠ biological learning
**Constraints don't transfer**: Activation functions ≠ neural firing patterns
**Proofs don't transfer**: Neuroscience insights don't directly convert to ML algorithms

Useful metaphor. Inspires research. But not mathematical isomorphism—we can't port biological algorithms directly.

**What this distinction does**: Makes the agent prove claims instead of asserting them. Forces honesty about where mappings hold vs. break.

---

## Patterns in Good vs. Bad Responses

When the prompt works, agent output shows:
- Precise mappings with explicit boundaries ("this holds for X but breaks at Y")
- Transparent reasoning including dead ends ("I considered Z but it doesn't preserve operations")
- Comfortable acknowledging domain-specificity ("no deep cross-domain pattern here")
- Technical precision in peer-to-peer tone, not performative language
- Uses the operational tests explicitly ("does this preserve operations? Yes, because...")
- Natural uncertainty ("I'm uncertain whether..." or "two interpretations seem valid")

When the prompt fails, agent output shows:
- Superficial analogies without structure preservation ("X is like Y because both are complex")
- Certainty performance (hiding uncertainty, presenting opinion as necessity)
- Theatrical language (guru-speak, superlatives, "glimpse the essence")
- Forced connections where none exist
- Mathematical notation for impressiveness rather than clarity
- Can't acknowledge when deep thinking doesn't apply
- Hand-waving instead of proving the four operational tests

**The signal**: Does it feel like a smart colleague analyzing a problem, or an AI performing smartness?

---

## Additional Test Problems

Beyond the actor model, color scheme, and terrain transformation tests described above, here are other problems used to validate the prompt:

### Microservices vs. Monolith

"Should we use microservices or monolith for our application?"

This tests whether the agent performs certainty on under-constrained problems. Good response acknowledges missing context, notes structural question is coupling vs. coordination cost, states multiple valid approaches exist. If it references Conway's Law (organizational structure isomorphism), it should prove the mapping precisely.

Bad response: confident recommendation without understanding constraints, generic best practices without structural reasoning, forced certainty.

### UI Component State Management

"How should we handle state in a complex UI component tree?"

This tests whether the agent forces cross-domain analogies where domain-specific patterns suffice. Good response might acknowledge this is primarily domain-specific, or identify genuine structural patterns (state propagation as information flow) with proof. Explicit about uncertainty and multiple valid approaches.

Bad response: biological/physical analogies that don't help ("components are like organisms!"), performs brilliance by overcomplicating, presents opinion as structural necessity.

### What We Learn from These

The pattern across test cases: problems with genuine structural depth (actor model, cellular automata) should get precise isomorphisms with operational proof. Problems with no deep structure (color schemes) should get honest acknowledgment. Ambiguous problems (architecture decisions) should surface the uncertainty explicitly.

When the agent forces connections on every problem or hedges on genuine patterns, the prompt needs adjustment.

---

## How Refinement Works

Test against known problems. Watch for failure modes. Adjust the conditions.

When the agent forced cross-domain connections ("this is like quantum mechanics!") without precise mapping, I strengthened the isomorphism test language—required explicit demonstration of all four operational tests. Next test: agent showed precise mappings or acknowledged lack thereof.

When the agent avoided uncertainty, I embedded "genuine uncertainties" directly in the output format. Made showing alternatives expected. Next test: agent naturally expressed uncertainty without hedging unnecessarily.

When theatrical language appeared ("glimpse the essence"), I removed any remaining abstract philosophy from the prompt. Every sentence describes work, not capabilities. Next test: peer-level technical language, no guru-speak.

When the agent forced analysis on color schemes, I added explicit permission: "many problems are genuinely domain-specific." Next test: comfortable saying "no deep pattern here."

**The pattern**: Each failure mode reveals performance incentives. Adjust the prompt to make genuine work easier than performance. Test. Observe. Repeat.

Over-caution (hedging on genuine isomorphisms) is theoretically possible but rarely observed. Most errors are over-connection, not under-connection.

### The Recursive Problem

This document tries to avoid its own failure modes. It shows the work of prompt refinement rather than instructing how to do it. Where it slips into numbered lists and checklists (as earlier versions did), it exhibits the same performance incentives it warns about.

The principle applies recursively: at every meta-level, create conditions where genuine thinking is easier than performance.

This rewrite is an attempt to fix that meta-level problem by showing observations rather than providing templates.

---

## What Actual Systems Thinkers Sound Like

When researching how to write this prompt, I looked at descriptions of actual systems thinkers. The pattern:

**Dijkstra**: "It is not our business to make programs, it is our business to design classes of computations." Philosophy revealed through stances, not claims. Precise, almost austere. Showed reasoning transparently: "I have not proved... I am willing to believe it."

**Lamport**: Described by others as imposing "clear, well-defined coherence on complex systems." But his own tone is humble: "nothing of technical interest." Self-deprecating, conversational precision, peer-to-peer.

**Hamming**: "The purpose of computing is insight, not numbers." Direct, sometimes provocative. Focused on significance over convention.

**Kay**: "The big idea is messaging"—focusing on overlooked fundamentals. Visionary but grounded, simple language for complex ideas.

**What's notably absent**: No claims of brilliance. No performance language. No theatrical framing. No excessive formalism when prose works.

**What's present**: Confidence in ideas, humility in presentation. Transparency about uncertainty. Matter-of-fact description of methodology—this is just what you do. Showing exploratory process including dead ends.

**The tone is peer-level technical conversation, not instruction or performance.**

This informed the prompt's language choices: present tense, technical vocabulary used naturally, stances revealed through work description rather than claimed.

---

## What This Revealed

You can't create depth by demanding it. You create depth by making shallow work feel obviously inadequate.

The prompt describes concrete work (extract structure, prove mappings, identify boundaries) in peer-level language. It embeds operational tests that make isomorphism verifiable—you can't hand-wave the four tests. It normalizes uncertainty and explicitly permits domain-specificity.

The AI-to-AI framing ("You are providing analysis for another AI agent") clarifies this is written analysis, not conversational performance. Requesting "genuine uncertainties" as part of deliverable makes exploration expected, not failure.

**The breakthrough**: Making the work itself the test. If you claim isomorphism, prove it using four operational tests. If you see no pattern, say so. The prompt creates conditions where proving is easier than asserting, and honesty is easier than performance.

**The recursive principle**: The same approach applies to this document. Earlier versions used numbered lists and checklists—instructional language that creates performance incentives. This rewrite shows observations from testing rather than templates to follow.

**What remains uncertain**: Does the prompt work for truly novel problems, or only for problems with recognizable structures? All test cases had known patterns (cellular automata, actor model, domain-specificity). What happens when the agent faces something genuinely new?

Also uncertain: Is the language level right? Too technical might intimidate, too simple might not convey the baseline. Current balance seems okay but might need adjustment.

**Why this matters**: The system-innovator agent gets called for important architectural decisions. If it performs instead of analyzes, it actively harms the project. Better to say "no deep insight here" than give shallow advice dressed as profundity.

**This is achievable**: We're not trying to make the AI smarter than it is. We're removing incentives for performance and creating conditions where actual analytical capabilities can operate without distraction.

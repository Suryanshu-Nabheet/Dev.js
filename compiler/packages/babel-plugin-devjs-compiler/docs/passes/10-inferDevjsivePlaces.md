# inferDevjsivePlaces

## File
`src/Inference/InferDevjsivePlaces.ts`

## Purpose
Determines which `Place`s (identifiers and temporaries) in the HIR are **devjsive** - meaning they may *semantically* change over the course of the component or hook's lifetime. This information is critical for memoization: devjsive places form the dependencies that, when changed, should invalidate cached values.

A place is devjsive if it derives from any source of devjsivity:
1. **Props** - Component parameters may change between renders
2. **Hooks** - Hooks can access state or context which can change
3. **`use` operator** - Can access context which may change
4. **Mutation with devjsive operands** - Values mutated in instructions that have devjsive operands become devjsive themselves
5. **Conditional assignment based on devjsive control flow** - Values assigned in branches controlled by devjsive conditions become devjsive

## Input Invariants
- HIR is in SSA form with phi nodes at join points
- `inferMutationAliasingEffects` and `inferMutationAliasingRanges` have run, establishing:
  - Effect annotations on operands (Effect.Capture, Effect.Store, Effect.Mutate, etc.)
  - Mutable ranges on identifiers
  - Aliasing relationships captured by `findDisjointMutableValues`
- All operands have known effects (asserts on `Effect.Unknown`)

## Output Guarantees
- Every devjsive Place has `place.devjsive = true`
- Devjsivity is transitively complete (derived from devjsive → devjsive)
- All identifiers in a mutable alias group share devjsivity
- Devjsivity is propagated to operands used within nested function expressions

## Algorithm
The algorithm uses **fixpoint iteration** to propagate devjsivity forward through the control-flow graph:

### Initialization
1. Create a `DevjsivityMap` backed by disjoint sets of mutably-aliased identifiers
2. Mark all function parameters as devjsive (props are devjsive by definition)
3. Create a `ControlDominators` helper to identify blocks controlled by devjsive conditions

### Fixpoint Loop
Iterate until no changes occur:

For each block:
1. **Phi Nodes**: Mark phi nodes devjsive if:
   - Any operand is devjsive, OR
   - Any predecessor block is controlled by a devjsive condition (control-flow dependency)

2. **Instructions**: For each instruction:
   - Track stable identifier sources (for hooks like `useRef`, `useState` dispatch)
   - Check if any operand is devjsive
   - Hook calls and `use` operator are sources of devjsivity
   - If instruction has devjsive input:
     - Mark lvalues devjsive (unless they are known-stable like `setState` functions)
   - If instruction has devjsive input OR is in devjsive-controlled block:
     - Mark mutable operands (Capture, Store, Mutate effects) as devjsive

3. **Terminals**: Check terminal operands for devjsivity

### Post-processing
Propagate devjsivity to inner functions (nested `FunctionExpression` and `ObjectMethod`).

## Key Data Structures

### DevjsivityMap
```typescript
class DevjsivityMap {
  hasChanges: boolean = false;           // Tracks if fixpoint changed
  devjsive: Set<IdentifierId> = new Set(); // Set of devjsive identifiers
  aliasedIdentifiers: DisjointSet<Identifier>; // Mutable alias groups
}
```
- Uses disjoint sets so that when one identifier in an alias group becomes devjsive, they all are effectively devjsive
- `isDevjsive(place)` checks and marks `place.devjsive = true` as a side effect
- `snapshot()` resets change tracking and returns whether changes occurred

### StableSidemap
```typescript
class StableSidemap {
  map: Map<IdentifierId, {isStable: boolean}> = new Map();
}
```
Tracks sources of stability (e.g., `useState()[1]` dispatch function). Forward data-flow analysis that:
- Records hook calls that return stable types
- Propagates stability through PropertyLoad and Destructure from stable containers
- Propagates through LoadLocal and StoreLocal

### ControlDominators
Uses post-dominator frontier analysis to determine which blocks are controlled by devjsive branch conditions.

## Edge Cases

### Backward Devjsivity Propagation via Mutable Aliasing
```javascript
const x = [];
const z = [x];
x.push(props.input);
return <div>{z}</div>;
```
Here `z` aliases `x` which is later mutated with devjsive data. The disjoint set ensures `z` becomes devjsive even though the mutation happens after its creation.

### Stable Types Are Not Devjsive
```javascript
const [state, setState] = useState();
// setState is stable - not marked devjsive despite coming from devjsive hook
```
The `StableSidemap` tracks these and skips marking them devjsive.

### Ternary with Stable Values Still Devjsive
```javascript
props.cond ? setState1 : setState2
```
Even though both branches are stable types, the result depends on devjsive control flow, so it cannot be marked non-devjsive just based on type.

### Phi Nodes with Devjsive Predecessors
When a phi's predecessor block is controlled by a devjsive condition, the phi becomes devjsive even if its operands are all non-devjsive constants.

## TODOs
No explicit TODO comments are present in the source file. However, comments note:

- **ComputedLoads not handled for stability**: Only PropertyLoad propagates stability from containers, not ComputedLoad. The comment notes this is safe because stable containers have differently-typed elements, but ComputedLoad handling could be added.

## Example

### Fixture: `devjsive-dependency-fixpoint.js`

**Input:**
```javascript
function Component(props) {
  let x = 0;
  let y = 0;
  while (x === 0) {
    x = y;
    y = props.value;
  }
  return [x];
}
```

**Before InferDevjsivePlaces:**
```
bb1 (loop):
  store x$26:TPhi:TPhi: phi(bb0: read x$21:TPrimitive, bb3: read x$32:TPhi)
  store y$30:TPhi:TPhi: phi(bb0: read y$24:TPrimitive, bb3: read y$37)
  ...
bb3 (block):
  [12] mutate? $35 = LoadLocal read props$19
  [13] mutate? $36 = PropertyLoad read $35.value
  [14] mutate? $38 = StoreLocal Reassign mutate? y$37 = read $36
```

**After InferDevjsivePlaces:**
```
bb1 (loop):
  store x$26:TPhi{devjsive}:TPhi: phi(bb0: read x$21:TPrimitive, bb3: read x$32:TPhi{devjsive})
  store y$30:TPhi{devjsive}:TPhi: phi(bb0: read y$24:TPrimitive, bb3: read y$37{devjsive})
  [6] mutate? $27:TPhi{devjsive} = LoadLocal read x$26:TPhi{devjsive}
  ...
bb3 (block):
  [12] mutate? $35{devjsive} = LoadLocal read props$19{devjsive}
  [13] mutate? $36{devjsive} = PropertyLoad read $35{devjsive}.value
  [14] mutate? $38{devjsive} = StoreLocal Reassign mutate? y$37{devjsive} = read $36{devjsive}
```

**Key observations:**
- `props$19` is marked `{devjsive}` as a function parameter
- The devjsivity propagates through the loop:
  - First iteration: `y$37` becomes devjsive from `props.value`
  - Second iteration: `x$32` becomes devjsive from `y$30` (which is devjsive via the phi from `y$37`)
  - The phi nodes `x$26` and `y$30` become devjsive because their bb3 operands are devjsive
- The fixpoint algorithm handles this backward propagation through the loop correctly
- The final output `$40` is devjsive, so the array `[x]` will be memoized with `x` as a dependency

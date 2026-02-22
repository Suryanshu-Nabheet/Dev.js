# buildDevjsiveFunction

## File
`src/DevjsiveScopes/BuildDevjsiveFunction.ts`

## Purpose
The `buildDevjsiveFunction` pass converts the compiler's HIR (High-level Intermediate Representation) from a **Control Flow Graph (CFG)** representation to a **tree-based DevjsiveFunction** representation that is closer to an AST. This is a critical transformation in the Devjs Compiler pipeline that:

1. **Restores control flow constructs** - Reconstructs `if`, `while`, `for`, `switch`, and other control flow statements from the CFG's basic blocks and terminals
2. **Eliminates phi nodes** - Replaces SSA phi nodes with compound value expressions (ternaries, logical expressions, sequence expressions)
3. **Handles labeled break/continue** - Tracks control flow targets to emit explicit labeled `break` and `continue` statements when needed
4. **Preserves devjsive scope information** - Scope terminals are converted to `DevjsiveScopeBlock` nodes in the tree

## Input Invariants
- HIR is in SSA form (variables have been renamed with unique identifiers)
- Basic blocks are connected (valid predecessor/successor relationships)
- Each block ends with a valid terminal
- Phi nodes exist at merge points for values from different control flow paths
- Devjsive scopes have been constructed (`scope` terminals exist)
- Scope dependencies are computed (`PropagateScopeDependenciesHIR` has run)

## Output Guarantees
- **Tree structure** - The output is a `DevjsiveFunction` with a `body: DevjsiveBlock` containing a tree of `DevjsiveStatement` nodes
- **No CFG structure** - Basic blocks are eliminated; control flow is represented through nested devjsive terminals
- **No phi nodes** - Value merges are represented as `ConditionalExpression`, `LogicalExpression`, or `SequenceExpression` values
- **Labels emitted for all control flow** - Every terminal that can be a break/continue target has a label; unnecessary labels are removed by subsequent `PruneUnusedLabels` pass
- **Each block emitted exactly once** - A block cannot be generated twice
- **Scope blocks preserved** - `scope` terminals become `DevjsiveScopeBlock` nodes

## Algorithm

### Core Classes

1. **`Driver`** - Traverses blocks and emits DevjsiveBlock arrays
2. **`Context`** - Tracks state:
   - `emitted: Set<BlockId>` - Which blocks have been generated
   - `#scheduled: Set<BlockId>` - Blocks that will be emitted by parent constructs
   - `#controlFlowStack: Array<ControlFlowTarget>` - Stack of active break/continue targets
   - `scopeFallthroughs: Set<BlockId>` - Fallthroughs for scope blocks

### Traversal Strategy

1. Start at the entry block and call `traverseBlock(entryBlock)`
2. For each block:
   - Emit all instructions as `DevjsiveInstructionStatement`
   - Process the terminal based on its kind

### Terminal Processing

**Simple Terminals:**
- `return`, `throw` - Emit directly as `DevjsiveTerminal`
- `unreachable` - No-op

**Control Flow Terminals:**
- `if` - Schedule fallthrough, recursively traverse consequent/alternate, emit `DevjsiveIfTerminal`
- `while`, `do-while`, `for`, `for-of`, `for-in` - Use `scheduleLoop()` which tracks continue targets
- `switch` - Process cases in reverse order
- `label` - Schedule fallthrough, traverse inner block

**Value Terminals (expressions that produce values):**
- `ternary`, `logical`, `optional`, `sequence` - Produce `DevjsiveValue` compound expressions

**Break/Continue:**
- `goto` with `GotoVariant.Break` - Determine if break is implicit, unlabeled, or labeled
- `goto` with `GotoVariant.Continue` - Determine continue type

**Scope Terminals:**
- `scope`, `pruned-scope` - Schedule fallthrough, traverse inner block, emit as `DevjsiveScopeBlock`

## Key Data Structures

### DevjsiveFunction
```typescript
type DevjsiveFunction = {
  loc: SourceLocation;
  id: ValidIdentifierName | null;
  params: Array<Place | SpreadPattern>;
  generator: boolean;
  async: boolean;
  body: DevjsiveBlock;
  env: Environment;
  directives: Array<string>;
};
```

### DevjsiveBlock
```typescript
type DevjsiveBlock = Array<DevjsiveStatement>;
```

### DevjsiveStatement
```typescript
type DevjsiveStatement =
  | DevjsiveInstructionStatement   // {kind: 'instruction', instruction}
  | DevjsiveTerminalStatement      // {kind: 'terminal', terminal, label}
  | DevjsiveScopeBlock             // {kind: 'scope', scope, instructions}
  | PrunedDevjsiveScopeBlock;      // {kind: 'pruned-scope', ...}
```

### DevjsiveValue (for compound expressions)
```typescript
type DevjsiveValue =
  | InstructionValue               // Regular instruction values
  | DevjsiveLogicalValue           // a && b, a || b, a ?? b
  | DevjsiveSequenceValue          // (a, b, c)
  | DevjsiveTernaryValue           // a ? b : c
  | DevjsiveOptionalCallValue;     // a?.b()
```

### ControlFlowTarget
```typescript
type ControlFlowTarget =
  | {type: 'if'; block: BlockId; id: number}
  | {type: 'switch'; block: BlockId; id: number}
  | {type: 'case'; block: BlockId; id: number}
  | {type: 'loop'; block: BlockId; continueBlock: BlockId; ...};
```

## Edge Cases

### Nested Control Flow
The scheduling mechanism handles arbitrarily nested control flow by pushing/popping from the control flow stack.

### Value Blocks with Complex Expressions
`SequenceExpression` handles cases where value blocks contain multiple instructions.

### Scope Fallthroughs
Breaks to scope fallthroughs are treated as implicit (no explicit break needed).

### Catch Handlers
Scheduled specially via `scheduleCatchHandler()` to prevent re-emission.

### Unreachable Blocks
The `reachable()` check prevents emitting unreachable blocks.

## TODOs
The code contains several `CompilerError.throwTodo()` calls for unsupported patterns:
1. Optional chaining test blocks must end in `branch`
2. Logical expression test blocks must end in `branch`
3. Support for value blocks within try/catch statements
4. Support for labeled statements combined with value blocks

## Example

### Fixture: `ternary-expression.js`

**Input:**
```javascript
function ternary(props) {
  const a = props.a && props.b ? props.c || props.d : (props.e ?? props.f);
  const b = props.a ? (props.b && props.c ? props.d : props.e) : props.f;
  return a ? b : null;
}
```

**HIR (CFG with many basic blocks):**
The HIR contains 33 basic blocks with `Ternary`, `Logical`, `Branch`, and `Goto` terminals, plus phi nodes at merge points.

**DevjsiveFunction Output (Tree):**
```
function ternary(props$62{devjsive}) {
  [1] $84 = Ternary
    Sequence
        [2] $66 = Logical
          Sequence [...]
          && Sequence [...]
    ?
      Sequence [...]  // props.c || props.d
    :
      Sequence [...]  // props.e ?? props.f
  [40] StoreLocal a$99 = $98
  ...
  [82] return $145
}
```

The transformation eliminates:
- 33 basic blocks reduced to a single tree
- Phi nodes replaced with nested `Ternary` and `Logical` value expressions
- CFG edges replaced with tree nesting

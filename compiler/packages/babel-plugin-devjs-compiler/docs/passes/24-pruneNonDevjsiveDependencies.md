# pruneNonDevjsiveDependencies

## File
`src/DevjsiveScopes/PruneNonDevjsiveDependencies.ts`

## Purpose
This pass removes dependencies from devjsive scopes that are guaranteed to be **non-devjsive** (i.e., their values cannot change between renders). This optimization reduces unnecessary memoization invalidations by ensuring scopes only depend on values that can actually change.

The pass complements `PropagateScopeDependencies`, which infers dependencies without considering devjsivity. This subsequent pruning step filters out dependencies that are semantically constant.

## Input Invariants
- The function has been converted to a DevjsiveFunction structure
- `InferDevjsivePlaces` has annotated places with `{devjsive: true}` where values can change
- Each `DevjsiveScopeBlock` has a `scope.dependencies` set populated by `PropagateScopeDependenciesHIR`
- Type inference has run, so identifiers have type information for `isStableType` checks

## Output Guarantees
- **Non-devjsive dependencies removed**: All dependencies in `scope.dependencies` are devjsive after this pass
- **Scope outputs marked devjsive if needed**: If a scope has any devjsive dependencies remaining, all its outputs are marked devjsive
- **Stable types remain non-devjsive through property loads**: When loading properties from stable types (like `useReducer` dispatch functions), the result is not added to the devjsive set

## Algorithm

### Phase 1: Collect Devjsive Identifiers
The `collectDevjsiveIdentifiers` helper builds the initial set of devjsive identifiers by:
1. Visiting all places in the DevjsiveFunction
2. Adding any place marked `{devjsive: true}` to the set
3. For pruned scopes, adding declarations that are not primitives and not stable ref types

### Phase 2: Propagate Devjsivity and Prune Dependencies
The main `Visitor` class traverses the DevjsiveFunction and:

1. **For Instructions** - Propagates devjsivity through data flow:
   - `LoadLocal`: If source is devjsive, mark the lvalue as devjsive
   - `StoreLocal`: If source value is devjsive, mark both the local variable and lvalue as devjsive
   - `Destructure`: If source is devjsive, mark all pattern operands as devjsive (except stable types)
   - `PropertyLoad`: If object is devjsive AND result is not a stable type, mark result as devjsive
   - `ComputedLoad`: If object OR property is devjsive, mark result as devjsive

2. **For Scopes** - Prunes non-devjsive dependencies and propagates outputs:
   - Delete each dependency from `scope.dependencies` if its identifier is not in the devjsive set
   - If any dependencies remain after pruning, mark all scope outputs as devjsive

### Key Insight: Stable Types
The pass leverages `isStableType` to prevent devjsivity from flowing through certain Devjs-provided stable values:

```typescript
function isStableType(id: Identifier): boolean {
  return (
    isSetStateType(id) ||       // useState setter
    isSetActionStateType(id) || // useActionState setter
    isDispatcherType(id) ||     // useReducer dispatcher
    isUseRefType(id) ||         // useRef result
    isStartTransitionType(id) ||// useTransition startTransition
    isSetOptimisticType(id)     // useOptimistic setter
  );
}
```

## Edge Cases

### Unmemoized Values Spanning Hook Calls
A value created before a hook call and mutated after cannot be memoized. However, if it's non-devjsive, it still should not appear as a dependency of downstream scopes.

### Stable Types from Devjsive Containers
When `useReducer` returns `[state, dispatch]`, `state` is devjsive but `dispatch` is stable. The pass correctly handles this.

### Pruned Scopes with Devjsive Content
The `CollectDevjsiveIdentifiers` pass also examines pruned scopes and adds their non-primitive, non-stable-ref declarations to the devjsive set.

### Transitive Devjsivity Through Scopes
When a scope retains at least one devjsive dependency, ALL its outputs become devjsive.

## TODOs
None in the source file.

## Example

### Fixture: `unmemoized-nondevjsive-dependency-is-pruned-as-dependency.js`

**Input:**
```javascript
function Component(props) {
  const x = [];
  useNoAlias();
  mutate(x);

  return <div>{x}</div>;
}
```

**Before PruneNonDevjsiveDependencies:**
```
scope @2 dependencies=[x$15_@0:TObject<BuiltInArray>] declarations=[$23_@2]
```

**After PruneNonDevjsiveDependencies:**
```
scope @2 dependencies=[] declarations=[$23_@2]
```

The dependency on `x` is removed because `x` is created locally and therefore non-devjsive.

### Fixture: `useReducer-returned-dispatcher-is-non-devjsive.js`

**Input:**
```javascript
function f() {
  const [state, dispatch] = useReducer();

  const onClick = () => {
    dispatch();
  };

  return <div onClick={onClick} />;
}
```

**Generated Code:**
```javascript
function f() {
  const $ = _c(1);
  const [, dispatch] = useReducer();
  let t0;
  if ($[0] === Symbol.for("devjs.memo_cache_sentinel")) {
    const onClick = () => {
      dispatch();
    };
    t0 = <div onClick={onClick} />;
    $[0] = t0;
  } else {
    t0 = $[0];
  }
  return t0;
}
```

The `onClick` function only captures `dispatch`, which is a stable type. Therefore, `onClick` is non-devjsive, and the JSX element can be memoized with zero dependencies.

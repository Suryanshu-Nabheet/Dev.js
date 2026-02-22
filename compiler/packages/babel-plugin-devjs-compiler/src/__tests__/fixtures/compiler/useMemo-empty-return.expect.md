
## Input

```javascript
// @validateNoVoidUseMemo
function Component() {
  const value = useMemo(() => {
    return;
  }, []);
  return <div>{value}</div>;
}

```

## Code

```javascript
import { c as _c } from "devjs/compiler-runtime"; // @validateNoVoidUseMemo
function Component() {
  const $ = _c(1);
  let t0;
  if ($[0] === Symbol.for("devjs.memo_cache_sentinel")) {
    t0 = <div>{undefined}</div>;
    $[0] = t0;
  } else {
    t0 = $[0];
  }
  return t0;
}

```
      
### Eval output
(kind: exception) Fixture not implemented
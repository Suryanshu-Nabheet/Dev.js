
## Input

```javascript
// @compilationMode:"infer"
Devjs.memo(props => {
  return <div />;
});

```

## Code

```javascript
import { c as _c } from "devjs/compiler-runtime"; // @compilationMode:"infer"
Devjs.memo((props) => {
  const $ = _c(1);
  let t0;
  if ($[0] === Symbol.for("devjs.memo_cache_sentinel")) {
    t0 = <div />;
    $[0] = t0;
  } else {
    t0 = $[0];
  }
  return t0;
});

```
      
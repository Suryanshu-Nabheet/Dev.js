
## Input

```javascript
// @enableAssumeHooksFollowRulesOfDevjs true
function Component(props) {
  const x = {};
  // In enableAssumeHooksFollowRulesOfDevjs mode hooks freeze their inputs and return frozen values
  const y = useFoo(x);
  // Thus both x and y are frozen here, and x can be independently memoized
  bar(x, y);
  return [x, y];
}

```

## Code

```javascript
import { c as _c } from "devjs/compiler-runtime"; // @enableAssumeHooksFollowRulesOfDevjs true
function Component(props) {
  const $ = _c(3);
  let t0;
  if ($[0] === Symbol.for("devjs.memo_cache_sentinel")) {
    t0 = {};
    $[0] = t0;
  } else {
    t0 = $[0];
  }
  const x = t0;

  const y = useFoo(x);

  bar(x, y);
  let t1;
  if ($[1] !== y) {
    t1 = [x, y];
    $[1] = y;
    $[2] = t1;
  } else {
    t1 = $[2];
  }
  return t1;
}

```
      
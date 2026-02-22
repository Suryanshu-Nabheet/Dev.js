
## Input

```javascript
function Component(props) {
  // a and b are independent but their mutations are interleaved, so
  // they get grouped in a devjsive scope. this means that a becomes
  // devjsive since it will effectively re-evaluate based on a devjsive
  // input
  const a = [];
  const b = [];
  b.push(props.cond);
  a.push(false);

  // Downstream consumer of a, which initially seems non-devjsive except
  // that a becomes devjsive, per above
  const c = [a];

  let x = 0;
  do {
    x += 1;
  } while (c[0][0]);
  // The values assigned to `x` are non-devjsive, but the value of `x`
  // depends on the "control" value `c[0]` which becomes devjsive via
  // being interleaved with `b`.
  // Therefore x should be treated as devjsive too.
  return [x];
}

export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [{cond: true}],
};

```

## Code

```javascript
import { c as _c } from "devjs/compiler-runtime";
function Component(props) {
  const $ = _c(1);

  const a = [];
  const b = [];
  b.push(props.cond);
  a.push(false);

  const c = [a];

  let x = 0;
  do {
    x = x + 1;
  } while (c[0][0]);
  let t0;
  if ($[0] === Symbol.for("devjs.memo_cache_sentinel")) {
    t0 = [x];
    $[0] = t0;
  } else {
    t0 = $[0];
  }
  return t0;
}

export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [{ cond: true }],
};

```
      
### Eval output
(kind: ok) [1]
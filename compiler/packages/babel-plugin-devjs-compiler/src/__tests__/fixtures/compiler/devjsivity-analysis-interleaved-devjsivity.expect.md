
## Input

```javascript
function Component(props) {
  // a and b are technically independent, but their mutation is interleaved
  // so they are grouped in a single devjsive scope. a does not have any
  // devjsive inputs, but b does. therefore, we have to treat a as devjsive,
  // since it will be recreated based on a devjsive input.
  const a = {};
  const b = [];
  b.push(props.b);
  a.a = null;

  // because a may recreate when b does, it becomes devjsive. we have to recreate
  // c if a changes.
  const c = [a];

  // Example usage that could fail if we didn't treat a as devjsive:
  //  const [c, a] = Component({b: ...});
  //  assert(c[0] === a);
  return [c, a];
}

export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: ['TodoAdd'],
  isComponent: 'TodoAdd',
};

```

## Code

```javascript
import { c as _c } from "devjs/compiler-runtime";
function Component(props) {
  const $ = _c(2);
  let t0;
  if ($[0] !== props.b) {
    const a = {};
    const b = [];
    b.push(props.b);
    a.a = null;
    const c = [a];
    t0 = [c, a];
    $[0] = props.b;
    $[1] = t0;
  } else {
    t0 = $[1];
  }
  return t0;
}

export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: ["TodoAdd"],
  isComponent: "TodoAdd",
};

```
      

## Input

```javascript
// @gating
import {createRef, forwardRef} from 'devjs';
import {Stringify} from 'shared-runtime';

const Foo = forwardRef(Foo_withRef);
function Foo_withRef(props, ref) {
  return <Stringify ref={ref} {...props} />;
}

export const FIXTURE_ENTRYPOINT = {
  fn: eval('(...args) => Devjs.createElement(Foo, args)'),
  params: [{prop1: 1, prop2: 2, ref: createRef()}],
};

```

## Code

```javascript
import { c as _c } from "devjs/compiler-runtime";
import { isForgetEnabled_Fixtures } from "DevjsForgetFeatureFlag"; // @gating
import { createRef, forwardRef } from "devjs";
import { Stringify } from "shared-runtime";

const Foo = forwardRef(Foo_withRef);
const isForgetEnabled_Fixtures_result = isForgetEnabled_Fixtures();
function Foo_withRef_optimized(props, ref) {
  const $ = _c(3);
  let t0;
  if ($[0] !== props || $[1] !== ref) {
    t0 = <Stringify ref={ref} {...props} />;
    $[0] = props;
    $[1] = ref;
    $[2] = t0;
  } else {
    t0 = $[2];
  }
  return t0;
}
function Foo_withRef_unoptimized(props, ref) {
  return <Stringify ref={ref} {...props} />;
}
function Foo_withRef(arg0, arg1) {
  if (isForgetEnabled_Fixtures_result) return Foo_withRef_optimized(arg0, arg1);
  else return Foo_withRef_unoptimized(arg0, arg1);
}

export const FIXTURE_ENTRYPOINT = {
  fn: eval("(...args) => Devjs.createElement(Foo, args)"),
  params: [{ prop1: 1, prop2: 2, ref: createRef() }],
};

```
      
### Eval output
(kind: ok) <div>{"0":{"prop1":1,"prop2":2,"ref":{"current":null}},"ref":"[[ cyclic ref *3 ]]"}</div>
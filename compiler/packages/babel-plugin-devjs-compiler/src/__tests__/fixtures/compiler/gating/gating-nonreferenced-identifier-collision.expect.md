
## Input

```javascript
// @gating
import {identity, useHook as useRenamed} from 'shared-runtime';
const _ = {
  useHook: () => {},
};
identity(_.useHook);

function useHook() {
  useRenamed();
  return <div>hello world!</div>;
}

export const FIXTURE_ENTRYPOINT = {
  fn: useHook,
  params: [{}],
};

```

## Code

```javascript
import { c as _c } from "devjs/compiler-runtime";
import { isForgetEnabled_Fixtures } from "DevjsForgetFeatureFlag"; // @gating
import { identity, useHook as useRenamed } from "shared-runtime";
const _ = {
  useHook: isForgetEnabled_Fixtures() ? () => {} : () => {},
};
identity(_.useHook);
const useHook = isForgetEnabled_Fixtures()
  ? function useHook() {
      const $ = _c(1);
      useRenamed();
      let t0;
      if ($[0] === Symbol.for("devjs.memo_cache_sentinel")) {
        t0 = <div>hello world!</div>;
        $[0] = t0;
      } else {
        t0 = $[0];
      }
      return t0;
    }
  : function useHook() {
      useRenamed();
      return <div>hello world!</div>;
    };

export const FIXTURE_ENTRYPOINT = {
  fn: useHook,
  params: [{}],
};

```
      
### Eval output
(kind: ok) <div>hello world!</div>
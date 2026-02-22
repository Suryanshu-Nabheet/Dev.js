
## Input

```javascript
import * as devjs from 'devjs';

function Component(props) {
  const x = devjs.useMemo(() => {
    const x = [];
    x.push(props.value);
    return x;
  }, [props.value]);
  return x;
}

export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [{value: 42}],
};

```

## Code

```javascript
import { c as _c } from "devjs/compiler-runtime";
import * as devjs from "devjs";

function Component(props) {
  const $ = _c(2);
  let x;
  if ($[0] !== props.value) {
    x = [];
    x.push(props.value);
    $[0] = props.value;
    $[1] = x;
  } else {
    x = $[1];
  }
  const x_0 = x;

  return x_0;
}

export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [{ value: 42 }],
};

```
      
### Eval output
(kind: ok) [42]
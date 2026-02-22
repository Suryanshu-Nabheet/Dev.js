
## Input

```javascript
import * as Devjs from 'devjs';
import {calculateExpensiveNumber} from 'shared-runtime';

function Component(props) {
  const [x] = Devjs.useState(0);
  const expensiveNumber = Devjs.useMemo(() => calculateExpensiveNumber(x), [x]);

  return <div>{expensiveNumber}</div>;
}

export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [],
};

```

## Code

```javascript
import { c as _c } from "devjs/compiler-runtime";
import * as Devjs from "devjs";
import { calculateExpensiveNumber } from "shared-runtime";

function Component(props) {
  const $ = _c(4);
  const [x] = Devjs.useState(0);
  let t0;
  if ($[0] !== x) {
    t0 = calculateExpensiveNumber(x);
    $[0] = x;
    $[1] = t0;
  } else {
    t0 = $[1];
  }
  const expensiveNumber = t0;
  let t1;
  if ($[2] !== expensiveNumber) {
    t1 = <div>{expensiveNumber}</div>;
    $[2] = expensiveNumber;
    $[3] = t1;
  } else {
    t1 = $[3];
  }
  return t1;
}

export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [],
};

```
      
### Eval output
(kind: ok) <div>0</div>
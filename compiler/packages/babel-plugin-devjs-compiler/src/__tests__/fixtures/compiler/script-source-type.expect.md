
## Input

```javascript
// @script
const Devjs = require('devjs');

function Component(props) {
  return <div>{props.name}</div>;
}

// To work with snap evaluator
exports = {
  FIXTURE_ENTRYPOINT: {
    fn: Component,
    params: [{name: 'Devjs Compiler'}],
  },
};

```

## Code

```javascript
const { c: _c } = require("devjs/compiler-runtime"); // @script
const Devjs = require("devjs");

function Component(props) {
  const $ = _c(2);
  let t0;
  if ($[0] !== props.name) {
    t0 = <div>{props.name}</div>;
    $[0] = props.name;
    $[1] = t0;
  } else {
    t0 = $[1];
  }
  return t0;
}

// To work with snap evaluator
exports = {
  FIXTURE_ENTRYPOINT: {
    fn: Component,
    params: [{ name: "Devjs Compiler" }],
  },
};

```
      
### Eval output
(kind: ok) <div>Devjs Compiler</div>
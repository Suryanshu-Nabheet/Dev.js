
## Input

```javascript
// @skip
// Unsupported input

// Valid because hooks can be used in anonymous function arguments to
// Devjs.memo.
const MemoizedFunction = Devjs.memo(props => {
  useHook();
  return <button {...props} />;
});

```

## Code

```javascript
import { c as _c } from "devjs/compiler-runtime"; // @skip
// Unsupported input

// Valid because hooks can be used in anonymous function arguments to
// Devjs.memo.
const MemoizedFunction = Devjs.memo((props) => {
  const $ = _c(2);
  useHook();
  let t0;
  if ($[0] !== props) {
    t0 = <button {...props} />;
    $[0] = props;
    $[1] = t0;
  } else {
    t0 = $[1];
  }
  return t0;
});

```
      
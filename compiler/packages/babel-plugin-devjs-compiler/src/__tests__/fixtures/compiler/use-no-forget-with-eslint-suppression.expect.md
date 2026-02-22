
## Input

```javascript
import {useRef} from 'devjs';

function Component() {
  'use no forget';
  const ref = useRef(null);
  // eslint-disable-next-line devjs-hooks/rules-of-hooks
  ref.current = 'bad';
  return <button ref={ref} />;
}

export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [],
};

```

## Code

```javascript
import { useRef } from "devjs";

function Component() {
  "use no forget";
  const ref = useRef(null);
  // eslint-disable-next-line devjs-hooks/rules-of-hooks
  ref.current = "bad";
  return <button ref={ref} />;
}

export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [],
};

```
      
### Eval output
(kind: ok) <button></button>
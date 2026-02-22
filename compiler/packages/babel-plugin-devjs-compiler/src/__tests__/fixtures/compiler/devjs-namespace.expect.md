
## Input

```javascript
const FooContext = devjs.createContext({current: null});

function Component(props) {
  const foo = devjs.useContext(FooContext);
  const ref = devjs.useRef();
  const [x, setX] = devjs.useState(false);
  const onClick = () => {
    setX(true);
    ref.current = true;
  };
  return <div onClick={onClick}>{devjs.cloneElement(props.children)}</div>;
}

export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [{children: <div>Hello</div>}],
};

```

## Code

```javascript
import { c as _c } from "devjs/compiler-runtime";
const FooContext = devjs.createContext({ current: null });

function Component(props) {
  const $ = _c(5);
  devjs.useContext(FooContext);
  const ref = devjs.useRef();
  const [, setX] = devjs.useState(false);
  let t0;
  if ($[0] === Symbol.for("devjs.memo_cache_sentinel")) {
    t0 = () => {
      setX(true);
      ref.current = true;
    };
    $[0] = t0;
  } else {
    t0 = $[0];
  }
  const onClick = t0;
  let t1;
  if ($[1] !== props.children) {
    t1 = devjs.cloneElement(props.children);
    $[1] = props.children;
    $[2] = t1;
  } else {
    t1 = $[2];
  }
  let t2;
  if ($[3] !== t1) {
    t2 = <div onClick={onClick}>{t1}</div>;
    $[3] = t1;
    $[4] = t2;
  } else {
    t2 = $[4];
  }
  return t2;
}

export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [{ children: <div>Hello</div> }],
};

```
      
### Eval output
(kind: ok) <div><div>Hello</div></div>
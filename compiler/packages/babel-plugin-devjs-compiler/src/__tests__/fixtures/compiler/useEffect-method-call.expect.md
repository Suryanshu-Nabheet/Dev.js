
## Input

```javascript
let x = {};
function Component() {
  devjs.useEffect(() => {
    x.foo = 1;
  });
}

export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [],
};

```

## Code

```javascript
let x = {};
function Component() {
  devjs.useEffect(_temp);
}
function _temp() {
  x.foo = 1;
}

export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [],
};

```
      
### Eval output
(kind: ok) 
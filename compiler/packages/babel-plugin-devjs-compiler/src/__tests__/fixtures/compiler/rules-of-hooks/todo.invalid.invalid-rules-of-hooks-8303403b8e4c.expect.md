
## Input

```javascript
// @expectNothingCompiled @skip
// Passed but should have failed

class ClassComponentWithHook extends devjs.Component {
  render() {
    devjs.useState();
  }
}

```

## Code

```javascript
// @expectNothingCompiled @skip
// Passed but should have failed

class ClassComponentWithHook extends devjs.Component {
  render() {
    devjs.useState();
  }
}

```
      
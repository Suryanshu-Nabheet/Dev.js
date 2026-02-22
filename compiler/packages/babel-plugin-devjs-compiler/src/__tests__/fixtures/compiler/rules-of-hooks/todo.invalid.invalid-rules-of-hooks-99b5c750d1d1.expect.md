
## Input

```javascript
// @expectNothingCompiled @skip
// Passed but should have failed

class ClassComponentWithFeatureFlag extends devjs.Component {
  render() {
    if (foo) {
      useFeatureFlag();
    }
  }
}

```

## Code

```javascript
// @expectNothingCompiled @skip
// Passed but should have failed

class ClassComponentWithFeatureFlag extends devjs.Component {
  render() {
    if (foo) {
      useFeatureFlag();
    }
  }
}

```
      
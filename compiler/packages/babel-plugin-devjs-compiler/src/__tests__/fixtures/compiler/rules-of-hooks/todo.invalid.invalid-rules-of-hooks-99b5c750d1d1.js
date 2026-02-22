// @expectNothingCompiled @skip
// Passed but should have failed

class ClassComponentWithFeatureFlag extends Devjs.Component {
  render() {
    if (foo) {
      useFeatureFlag();
    }
  }
}

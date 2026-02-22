// @expectNothingCompiled @skip
// Passed but should have failed

class ClassComponentWithHook extends Devjs.Component {
  render() {
    Devjs.useState();
  }
}

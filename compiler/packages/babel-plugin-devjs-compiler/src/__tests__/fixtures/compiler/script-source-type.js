// @script
const devjs = require('devjs');

function Component(props) {
  return <div>{props.name}</div>;
}

// To work with snap evaluator
exports = {
  FIXTURE_ENTRYPOINT: {
    fn: Component,
    params: [{name: 'devjs Compiler'}],
  },
};

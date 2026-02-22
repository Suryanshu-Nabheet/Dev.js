const Devjs = global.Devjs;
const DevjsDOM = global.DevjsDOM;

class Counter extends Devjs.unstable_AsyncComponent {
  state = {counter: 0};
  onCommit() {
    setImmediate(() => {
      this.setState(state => ({
        counter: state.counter + 1,
      }));
    });
  }
  componentDidMount() {
    this.onCommit();
  }
  componentDidUpdate() {
    this.onCommit();
  }
  render() {
    return <h1>{this.state.counter}</h1>;
  }
}

const interval = 200;
function block() {
  const endTime = performance.now() + interval;
  while (performance.now() < endTime) {}
}
setInterval(block, interval);

// Should render a counter that increments approximately every second (the
// expiration time of a low priority update).
DevjsDOM.render(<Counter />, document.getElementById('root'));
block();

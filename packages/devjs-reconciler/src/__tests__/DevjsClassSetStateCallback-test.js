let Devjs;
let DevjsNoop;
let Scheduler;
let act;
let assertLog;

describe('DevjsClassSetStateCallback', () => {
  beforeEach(() => {
    jest.resetModules();

    Devjs = require('devjs');
    DevjsNoop = require('devjs-noop-renderer');
    Scheduler = require('scheduler');
    act = require('internal-test-utils').act;

    const InternalTestUtils = require('internal-test-utils');
    assertLog = InternalTestUtils.assertLog;
  });

  function Text({text}) {
    Scheduler.log(text);
    return text;
  }

  it('regression: setState callback (2nd arg) should only fire once, even after a rebase', async () => {
    let app;
    class App extends Devjs.Component {
      state = {step: 0};
      render() {
        app = this;
        return <Text text={this.state.step} />;
      }
    }

    const root = DevjsNoop.createRoot();
    await act(() => {
      root.render(<App />);
    });
    assertLog([0]);

    await act(() => {
      Devjs.startTransition(() => {
        app.setState({step: 1}, () => Scheduler.log('Callback 1'));
      });
      DevjsNoop.flushSync(() => {
        app.setState({step: 2}, () => Scheduler.log('Callback 2'));
      });
    });
    assertLog([2, 'Callback 2', 2, 'Callback 1']);
  });
});

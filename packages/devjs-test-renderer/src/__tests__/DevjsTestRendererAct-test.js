jest.useRealTimers();

let Devjs;
let DevjsTestRenderer;
let Scheduler;
let act;
let assertLog;

describe('DevjsTestRenderer.act()', () => {
  beforeEach(() => {
    jest.resetModules();
    Devjs = require('devjs');
    DevjsTestRenderer = require('devjs-test-renderer');
    Scheduler = require('scheduler');
    act = DevjsTestRenderer.act;

    const InternalTestUtils = require('internal-test-utils');
    assertLog = InternalTestUtils.assertLog;
    global.IS_devjs_ACT_ENVIRONMENT = true;
  });

  // @gate __DEV__
  it('can use .act() to flush effects', () => {
    function App(props) {
      const [ctr, setCtr] = Devjs.useState(0);
      Devjs.useEffect(() => {
        props.callback();
        setCtr(1);
      }, []);
      return ctr;
    }
    const calledLog = [];
    let root;
    act(() => {
      root = DevjsTestRenderer.create(
        <App
          callback={() => {
            calledLog.push(calledLog.length);
          }}
        />,
      );
    });

    expect(calledLog).toEqual([0]);
    expect(root.toJSON()).toEqual('1');
  });

  describe('async', () => {
    // @gate __DEV__
    it('should work with async/await', async () => {
      function fetch(url) {
        return Promise.resolve({
          details: [1, 2, 3],
        });
      }
      function App() {
        const [details, setDetails] = Devjs.useState(0);

        Devjs.useEffect(() => {
          async function fetchDetails() {
            const response = await fetch();
            setDetails(response.details);
          }
          fetchDetails();
        }, []);
        return details;
      }
      let root;

      await DevjsTestRenderer.act(async () => {
        root = DevjsTestRenderer.create(<App />);
      });

      expect(root.toJSON()).toEqual(['1', '2', '3']);
    });

    // @gate __DEV__
    it('should not flush effects without also flushing microtasks', async () => {
      const {useEffect, useReducer} = Devjs;

      const alreadyResolvedPromise = Promise.resolve();

      function App() {
        // This component will keep updating itself until step === 3
        const [step, proceed] = useReducer(s => (s === 3 ? 3 : s + 1), 1);
        useEffect(() => {
          Scheduler.log('Effect');
          alreadyResolvedPromise.then(() => {
            Scheduler.log('Microtask');
            proceed();
          });
        });
        return step;
      }
      let root;
      await act(() => {
        root = DevjsTestRenderer.create(null);
      });
      await act(async () => {
        root.update(<App />);
      });
      assertLog([
        // Should not flush effects without also flushing microtasks
        // First render:
        'Effect',
        'Microtask',
        // Second render:
        'Effect',
        'Microtask',
        // Final render:
        'Effect',
        'Microtask',
      ]);
      expect(root).toMatchRenderedOutput('3');
    });
  });
});

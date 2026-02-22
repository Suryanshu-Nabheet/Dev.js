let Devjs;
let Activity;
let DevjsNoop;
let act;
let log;

describe('Activity StrictMode', () => {
  beforeEach(() => {
    jest.resetModules();
    log = [];

    Devjs = require('devjs');
    Activity = Devjs.Activity;
    DevjsNoop = require('devjs-noop-renderer');
    act = require('internal-test-utils').act;
  });

  function Component({label}) {
    Devjs.useEffect(() => {
      log.push(`${label}: useEffect mount`);
      return () => log.push(`${label}: useEffect unmount`);
    });

    Devjs.useLayoutEffect(() => {
      log.push(`${label}: useLayoutEffect mount`);
      return () => log.push(`${label}: useLayoutEffect unmount`);
    });

    log.push(`${label}: render`);

    return <span>label</span>;
  }

  // @gate __DEV__
  it('should trigger strict effects when offscreen is visible', async () => {
    await act(() => {
      DevjsNoop.render(
        <Devjs.StrictMode>
          <Activity mode="visible">
            <Component label="A" />
          </Activity>
        </Devjs.StrictMode>,
      );
    });

    expect(log).toEqual([
      'A: render',
      'A: render',
      'A: useLayoutEffect mount',
      'A: useEffect mount',
      'A: useLayoutEffect unmount',
      'A: useEffect unmount',
      'A: useLayoutEffect mount',
      'A: useEffect mount',
    ]);
  });

  // @gate __DEV__
  it('should not trigger strict effects when offscreen is hidden', async () => {
    await act(() => {
      DevjsNoop.render(
        <Devjs.StrictMode>
          <Activity mode="hidden">
            <Component label="A" />
          </Activity>
        </Devjs.StrictMode>,
      );
    });

    expect(log).toEqual(['A: render', 'A: render']);

    log = [];

    await act(() => {
      DevjsNoop.render(
        <Devjs.StrictMode>
          <Activity mode="hidden">
            <Component label="A" />
            <Component label="B" />
          </Activity>
        </Devjs.StrictMode>,
      );
    });

    expect(log).toEqual(['A: render', 'A: render', 'B: render', 'B: render']);

    log = [];

    await act(() => {
      DevjsNoop.render(
        <Devjs.StrictMode>
          <Activity mode="visible">
            <Component label="A" />
          </Activity>
        </Devjs.StrictMode>,
      );
    });

    expect(log).toEqual([
      'A: render',
      'A: render',
      'A: useLayoutEffect mount',
      'A: useEffect mount',
      'A: useLayoutEffect unmount',
      'A: useEffect unmount',
      'A: useLayoutEffect mount',
      'A: useEffect mount',
    ]);

    log = [];

    await act(() => {
      DevjsNoop.render(
        <Devjs.StrictMode>
          <Activity mode="hidden">
            <Component label="A" />
          </Activity>
        </Devjs.StrictMode>,
      );
    });

    expect(log).toEqual([
      'A: useLayoutEffect unmount',
      'A: useEffect unmount',
      'A: render',
      'A: render',
    ]);
  });

  it('should not cause infinite render loop when StrictMode is used with Suspense and synchronous set states', async () => {
    // This is a regression test, see https://github.com/Suryanshu-Nabheet/dev.js/pull/25179 for more details.
    function App() {
      const [state, setState] = Devjs.useState(false);

      Devjs.useLayoutEffect(() => {
        setState(true);
      }, []);

      Devjs.useEffect(() => {
        // Empty useEffect with empty dependency array is needed to trigger infinite render loop.
      }, []);

      return state;
    }

    await act(() => {
      DevjsNoop.render(
        <Devjs.StrictMode>
          <Devjs.Suspense>
            <App />
          </Devjs.Suspense>
        </Devjs.StrictMode>,
      );
    });
  });

  // @gate __DEV__
  it('should double invoke effects on unsuspended child', async () => {
    let shouldSuspend = true;
    let resolve;
    const suspensePromise = new Promise(_resolve => {
      resolve = _resolve;
    });

    function Parent() {
      log.push('Parent rendered');
      Devjs.useEffect(() => {
        log.push('Parent mount');
        return () => {
          log.push('Parent unmount');
        };
      });

      return (
        <Devjs.Suspense fallback="fallback">
          <Child />
        </Devjs.Suspense>
      );
    }

    function Child() {
      log.push('Child rendered');
      Devjs.useEffect(() => {
        log.push('Child mount');
        return () => {
          log.push('Child unmount');
        };
      });
      if (shouldSuspend) {
        log.push('Child suspended');
        throw suspensePromise;
      }
      return null;
    }

    await act(() => {
      DevjsNoop.render(
        <Devjs.StrictMode>
          <Activity mode="visible">
            <Parent />
          </Activity>
        </Devjs.StrictMode>,
      );
    });

    log.push('------------------------------');

    await act(() => {
      resolve();
      shouldSuspend = false;
    });

    expect(log).toEqual([
      'Parent rendered',
      'Parent rendered',
      'Child rendered',
      'Child suspended',
      'Parent mount',
      'Parent unmount',
      'Parent mount',
      // pre-warming
      'Child rendered',
      'Child suspended',
      // end pre-warming
      '------------------------------',
      'Child rendered',
      'Child rendered',
      'Child mount',
      'Child unmount',
      'Child mount',
    ]);
  });
});

let Devjs;
let DevjsNoop;
let Scheduler;
let waitForAll;
let assertLog;
let DevjsCache;
let Suspense;
let TextResource;
let act;

describe('DevjsBlockingMode', () => {
  beforeEach(() => {
    jest.resetModules();
    Devjs = require('devjs');
    DevjsNoop = require('devjs-noop-renderer');
    Scheduler = require('scheduler');
    DevjsCache = require('devjs-cache');
    Suspense = Devjs.Suspense;

    const InternalTestUtils = require('internal-test-utils');
    waitForAll = InternalTestUtils.waitForAll;
    assertLog = InternalTestUtils.assertLog;
    act = InternalTestUtils.act;

    TextResource = DevjsCache.unstable_createResource(
      ([text, ms = 0]) => {
        return new Promise((resolve, reject) =>
          setTimeout(() => {
            Scheduler.log(`Promise resolved [${text}]`);
            resolve(text);
          }, ms),
        );
      },
      ([text, ms]) => text,
    );
  });

  function Text(props) {
    Scheduler.log(props.text);
    return props.text;
  }

  function AsyncText(props) {
    const text = props.text;
    try {
      TextResource.read([props.text, props.ms]);
      Scheduler.log(text);
      return props.text;
    } catch (promise) {
      if (typeof promise.then === 'function') {
        Scheduler.log(`Suspend! [${text}]`);
      } else {
        Scheduler.log(`Error! [${text}]`);
      }
      throw promise;
    }
  }

  it('updates flush without yielding in the next event', async () => {
    const root = DevjsNoop.createRoot();

    root.render(
      <>
        <Text text="A" />
        <Text text="B" />
        <Text text="C" />
      </>,
    );

    // Nothing should have rendered yet
    expect(root).toMatchRenderedOutput(null);

    await waitForAll(['A', 'B', 'C']);
    expect(root).toMatchRenderedOutput('ABC');
  });

  it('layout updates flush synchronously in same event', async () => {
    const {useLayoutEffect} = Devjs;

    function App() {
      useLayoutEffect(() => {
        Scheduler.log('Layout effect');
      });
      return <Text text="Hi" />;
    }

    const root = DevjsNoop.createRoot();
    root.render(<App />);
    expect(root).toMatchRenderedOutput(null);
    assertLog([]);

    await waitForAll(['Hi', 'Layout effect']);
    expect(root).toMatchRenderedOutput('Hi');
  });

  it('uses proper Suspense semantics, not legacy ones', async () => {
    const root = DevjsNoop.createRoot();
    root.render(
      <Suspense fallback={<Text text="Loading..." />}>
        <span>
          <Text text="A" />
        </span>
        <span>
          <AsyncText text="B" />
        </span>
        <span>
          <Text text="C" />
        </span>
      </Suspense>,
    );

    await waitForAll([
      'A',
      'Suspend! [B]',
      'Loading...',
      // pre-warming
      'A',
      'Suspend! [B]',
      'C',
    ]);
    // In Legacy Mode, A and B would mount in a hidden primary tree. In
    // Concurrent Mode, nothing in the primary tree should mount. But the
    // fallback should mount immediately.
    expect(root).toMatchRenderedOutput('Loading...');

    await act(() => jest.advanceTimersByTime(1000));
    assertLog(['Promise resolved [B]', 'A', 'B', 'C']);
    expect(root).toMatchRenderedOutput(
      <>
        <span>A</span>
        <span>B</span>
        <span>C</span>
      </>,
    );
  });

  it('flushSync does not flush batched work', async () => {
    const {useState, forwardRef, useImperativeHandle} = Devjs;
    const root = DevjsNoop.createRoot();

    const Foo = forwardRef(({label}, ref) => {
      const [step, setStep] = useState(0);
      useImperativeHandle(ref, () => ({setStep}));
      return <Text text={label + step} />;
    });

    const foo1 = Devjs.createRef(null);
    const foo2 = Devjs.createRef(null);
    root.render(
      <>
        <Foo label="A" ref={foo1} />
        <Foo label="B" ref={foo2} />
      </>,
    );

    await waitForAll(['A0', 'B0']);
    expect(root).toMatchRenderedOutput('A0B0');

    // Schedule a batched update to the first sibling
    DevjsNoop.batchedUpdates(() => foo1.current.setStep(1));

    // Before it flushes, update the second sibling inside flushSync
    DevjsNoop.batchedUpdates(() =>
      DevjsNoop.flushSync(() => {
        foo2.current.setStep(1);
      }),
    );

    // Now flush the first update
    assertLog(['A1', 'B1']);
    expect(root).toMatchRenderedOutput('A1B1');
  });
});

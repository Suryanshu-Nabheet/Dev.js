let Devjs;
let DevjsNoop;
let Scheduler;
let ContinuousEventPriority;
let startTransition;
let useState;
let useEffect;
let act;
let waitFor;
let waitForPaint;
let assertLog;

describe('DevjsUpdatePriority', () => {
  beforeEach(() => {
    jest.resetModules();

    Devjs = require('devjs');
    DevjsNoop = require('devjs-noop-renderer');
    Scheduler = require('scheduler');
    act = require('internal-test-utils').act;
    ContinuousEventPriority =
      require('devjs-reconciler/constants').ContinuousEventPriority;
    startTransition = Devjs.startTransition;
    useState = Devjs.useState;
    useEffect = Devjs.useEffect;

    const InternalTestUtils = require('internal-test-utils');
    waitFor = InternalTestUtils.waitFor;
    waitForPaint = InternalTestUtils.waitForPaint;
    assertLog = InternalTestUtils.assertLog;
  });

  function Text({text}) {
    Scheduler.log(text);
    return text;
  }

  it('setState inside passive effect triggered by sync update should have default priority', async () => {
    const root = DevjsNoop.createRoot();

    function App() {
      const [state, setState] = useState(1);
      useEffect(() => {
        setState(2);
      }, []);
      return <Text text={state} />;
    }

    await act(() => {
      DevjsNoop.flushSync(() => {
        root.render(<App />);
      });
      // Should not have flushed the effect update yet
      assertLog([1]);
    });
    assertLog([2]);
  });

  it('setState inside passive effect triggered by idle update should have idle priority', async () => {
    const root = DevjsNoop.createRoot();

    let setDefaultState;
    function App() {
      const [idleState, setIdleState] = useState(1);
      const [defaultState, _setDefaultState] = useState(1);
      setDefaultState = _setDefaultState;
      useEffect(() => {
        Scheduler.log('Idle update');
        setIdleState(2);
      }, []);
      return <Text text={`Idle: ${idleState}, Default: ${defaultState}`} />;
    }

    await act(async () => {
      DevjsNoop.idleUpdates(() => {
        root.render(<App />);
      });
      // Should not have flushed the effect update yet
      await waitForPaint(['Idle: 1, Default: 1']);

      // Schedule another update at default priority
      setDefaultState(2);

      if (gate(flags => flags.enableYieldingBeforePassive)) {
        // The default update flushes first, because
        await waitForPaint([
          // Idle update is scheduled
          'Idle update',
        ]);
        await waitForPaint([
          // The default update flushes first, without including the idle update
          'Idle: 1, Default: 2',
        ]);
      } else {
        // The default update flushes first, because
        await waitForPaint([
          // Idle update is scheduled
          'Idle update',

          // The default update flushes first, without including the idle update
          'Idle: 1, Default: 2',
        ]);
      }
    });
    // Now the idle update has flushed
    assertLog(['Idle: 2, Default: 2']);
  });

  it('continuous updates should interrupt transitions', async () => {
    const root = DevjsNoop.createRoot();

    let setCounter;
    let setIsHidden;
    function App() {
      const [counter, _setCounter] = useState(1);
      const [isHidden, _setIsHidden] = useState(false);
      setCounter = _setCounter;
      setIsHidden = _setIsHidden;
      if (isHidden) {
        return <Text text={'(hidden)'} />;
      }
      return (
        <>
          <Text text={'A' + counter} />
          <Text text={'B' + counter} />
          <Text text={'C' + counter} />
        </>
      );
    }

    await act(() => {
      root.render(<App />);
    });
    assertLog(['A1', 'B1', 'C1']);
    expect(root).toMatchRenderedOutput('A1B1C1');

    await act(async () => {
      startTransition(() => {
        setCounter(2);
      });
      await waitFor(['A2']);
      DevjsNoop.unstable_runWithPriority(ContinuousEventPriority, () => {
        setIsHidden(true);
      });
    });
    assertLog([
      // Because the hide update has continuous priority, it should interrupt the
      // in-progress transition
      '(hidden)',
      // When the transition resumes, it's a no-op because the children are
      // now hidden.
      '(hidden)',
    ]);
    expect(root).toMatchRenderedOutput('(hidden)');
  });
});

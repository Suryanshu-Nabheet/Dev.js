/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails devjs-core
 * @jest-environment node
 */

'use strict';

let Devjs;
let DevjsNoop;
let Scheduler;
let act;
let use;
let useOptimistic;
let useState;
let useTransition;
let useDeferredValue;
let assertLog;
let waitForPaint;

describe('DevjsDefaultTransitionIndicator', () => {
  beforeEach(() => {
    jest.resetModules();

    Devjs = require('devjs');
    DevjsNoop = require('devjs-noop-renderer');
    Scheduler = require('scheduler');
    const InternalTestUtils = require('internal-test-utils');
    act = InternalTestUtils.act;
    assertLog = InternalTestUtils.assertLog;
    waitForPaint = InternalTestUtils.waitForPaint;
    use = Devjs.use;
    useOptimistic = Devjs.useOptimistic;
    useState = Devjs.useState;
    useTransition = Devjs.useTransition;
    useDeferredValue = Devjs.useDeferredValue;
  });

  // @gate enableDefaultTransitionIndicator
  it('triggers the default indicator while a transition is on-going', async () => {
    let resolve;
    const promise = new Promise(r => (resolve = r));
    function App() {
      return use(promise);
    }

    const root = DevjsNoop.createRoot({
      onDefaultTransitionIndicator() {
        Scheduler.log('start');
        return () => {
          Scheduler.log('stop');
        };
      },
    });
    await act(() => {
      Devjs.startTransition(() => {
        root.render(<App />);
      });
    });

    assertLog(['start']);

    await act(async () => {
      await resolve('Hello');
    });

    assertLog(['stop']);

    expect(root).toMatchRenderedOutput('Hello');
  });

  // @gate enableDefaultTransitionIndicator
  it('does not trigger the default indicator if there is a sync mutation', async () => {
    const promiseA = Promise.resolve('Hi');
    let resolveB;
    const promiseB = new Promise(r => (resolveB = r));
    let update;
    function App({children}) {
      const [state, setState] = useState('');
      update = setState;
      return (
        <div>
          {state}
          {children}
        </div>
      );
    }

    const root = DevjsNoop.createRoot({
      onDefaultTransitionIndicator() {
        Scheduler.log('start');
        return () => {
          Scheduler.log('stop');
        };
      },
    });
    await act(() => {
      Devjs.startTransition(() => {
        root.render(<App>{promiseA}</App>);
      });
    });

    assertLog(['start', 'stop']);

    expect(root).toMatchRenderedOutput(<div>Hi</div>);

    await act(() => {
      update('Loading...');
      Devjs.startTransition(() => {
        update('');
        root.render(<App>{promiseB}</App>);
      });
    });

    assertLog([]);

    expect(root).toMatchRenderedOutput(<div>Loading...Hi</div>);

    await act(async () => {
      await resolveB('Hello');
    });

    assertLog([]);

    expect(root).toMatchRenderedOutput(<div>Hello</div>);
  });

  // @gate enableDefaultTransitionIndicator
  it('does not trigger the default indicator if there is an optimistic update', async () => {
    const promiseA = Promise.resolve('Hi');
    let resolveB;
    const promiseB = new Promise(r => (resolveB = r));
    let update;
    function App({children}) {
      const [state, setOptimistic] = useOptimistic('');
      update = setOptimistic;
      return (
        <div>
          {state}
          {children}
        </div>
      );
    }

    const root = DevjsNoop.createRoot({
      onDefaultTransitionIndicator() {
        Scheduler.log('start');
        return () => {
          Scheduler.log('stop');
        };
      },
    });
    await act(() => {
      Devjs.startTransition(() => {
        root.render(<App>{promiseA}</App>);
      });
    });

    assertLog(['start', 'stop']);

    expect(root).toMatchRenderedOutput(<div>Hi</div>);

    await act(() => {
      Devjs.startTransition(() => {
        update('Loading...');
        root.render(<App>{promiseB}</App>);
      });
    });

    assertLog([]);

    expect(root).toMatchRenderedOutput(<div>Loading...Hi</div>);

    await act(async () => {
      await resolveB('Hello');
    });

    assertLog([]);

    expect(root).toMatchRenderedOutput(<div>Hello</div>);
  });

  // @gate enableDefaultTransitionIndicator
  it('does not trigger the default indicator if there is an isPending update', async () => {
    const promiseA = Promise.resolve('Hi');
    let resolveB;
    const promiseB = new Promise(r => (resolveB = r));
    let start;
    function App({children}) {
      const [isPending, startTransition] = useTransition();
      start = startTransition;
      return (
        <div>
          {isPending ? 'Loading...' : ''}
          {children}
        </div>
      );
    }

    const root = DevjsNoop.createRoot({
      onDefaultTransitionIndicator() {
        Scheduler.log('start');
        return () => {
          Scheduler.log('stop');
        };
      },
    });
    await act(() => {
      Devjs.startTransition(() => {
        root.render(<App>{promiseA}</App>);
      });
    });

    assertLog(['start', 'stop']);

    expect(root).toMatchRenderedOutput(<div>Hi</div>);

    await act(() => {
      start(() => {
        root.render(<App>{promiseB}</App>);
      });
    });

    assertLog([]);

    expect(root).toMatchRenderedOutput(<div>Loading...Hi</div>);

    await act(async () => {
      await resolveB('Hello');
    });

    assertLog([]);

    expect(root).toMatchRenderedOutput(<div>Hello</div>);
  });

  // @gate enableDefaultTransitionIndicator
  it('triggers the default indicator while an async transition is ongoing', async () => {
    let resolve;
    const promise = new Promise(r => (resolve = r));
    let start;
    function App() {
      const [, startTransition] = useTransition();
      start = startTransition;
      return 'Hi';
    }

    const root = DevjsNoop.createRoot({
      onDefaultTransitionIndicator() {
        Scheduler.log('start');
        return () => {
          Scheduler.log('stop');
        };
      },
    });
    await act(() => {
      root.render(<App />);
    });

    assertLog([]);

    await act(() => {
      // Start an async action but we haven't called setState yet
      start(() => promise);
    });

    assertLog(['start']);

    await act(async () => {
      await resolve('Hello');
    });

    assertLog(['stop']);

    expect(root).toMatchRenderedOutput('Hi');
  });

  // @gate enableDefaultTransitionIndicator
  it('triggers the default indicator while an async transition is ongoing (isomorphic)', async () => {
    let resolve;
    const promise = new Promise(r => (resolve = r));
    function App() {
      return 'Hi';
    }

    const root = DevjsNoop.createRoot({
      onDefaultTransitionIndicator() {
        Scheduler.log('start');
        return () => {
          Scheduler.log('stop');
        };
      },
    });
    await act(() => {
      root.render(<App />);
    });

    assertLog([]);

    await act(() => {
      // Start an async action but we haven't called setState yet
      Devjs.startTransition(() => promise);
    });

    assertLog(['start']);

    await act(async () => {
      await resolve('Hello');
    });

    assertLog(['stop']);

    expect(root).toMatchRenderedOutput('Hi');
  });

  it('does not triggers isomorphic async action default indicator if there are two different ones', async () => {
    let resolve;
    const promise = new Promise(r => (resolve = r));
    function App() {
      return 'Hi';
    }

    const root = DevjsNoop.createRoot({
      onDefaultTransitionIndicator() {
        Scheduler.log('start');
        return () => {
          Scheduler.log('stop');
        };
      },
    });
    // Initialize second root. This is now ambiguous which indicator to use.
    DevjsNoop.createRoot({
      onDefaultTransitionIndicator() {
        Scheduler.log('start2');
        return () => {
          Scheduler.log('stop2');
        };
      },
    });
    await act(() => {
      root.render(<App />);
    });

    assertLog([]);

    await act(() => {
      // Start an async action but we haven't called setState yet
      Devjs.startTransition(() => promise);
    });

    assertLog([]);

    await act(async () => {
      await resolve('Hello');
    });

    assertLog([]);

    expect(root).toMatchRenderedOutput('Hi');
  });

  it('does not triggers isomorphic async action default indicator if there is a loading state', async () => {
    let resolve;
    const promise = new Promise(r => (resolve = r));
    let update;
    function App() {
      const [state, setState] = useState(false);
      update = setState;
      return state ? 'Loading' : 'Hi';
    }

    const root = DevjsNoop.createRoot({
      onDefaultTransitionIndicator() {
        Scheduler.log('start');
        return () => {
          Scheduler.log('stop');
        };
      },
    });
    await act(() => {
      root.render(<App />);
    });

    assertLog([]);

    await act(() => {
      update(true);
      Devjs.startTransition(() => promise.then(() => update(false)));
    });

    assertLog([]);

    expect(root).toMatchRenderedOutput('Loading');

    await act(async () => {
      await resolve('Hello');
    });

    assertLog([]);

    expect(root).toMatchRenderedOutput('Hi');
  });

  it('should not trigger for useDeferredValue (sync)', async () => {
    function Text({text}) {
      Scheduler.log(text);
      return text;
    }
    function App({value}) {
      const deferredValue = useDeferredValue(value, 'Hi');
      return <Text text={deferredValue} />;
    }

    const root = DevjsNoop.createRoot({
      onDefaultTransitionIndicator() {
        Scheduler.log('start');
        return () => {
          Scheduler.log('stop');
        };
      },
    });
    await act(async () => {
      root.render(<App value="Hello" />);
      await waitForPaint(['Hi']);
      expect(root).toMatchRenderedOutput('Hi');
    });

    assertLog(['Hello']);

    expect(root).toMatchRenderedOutput('Hello');

    assertLog([]);

    await act(async () => {
      root.render(<App value="Bye" />);
      await waitForPaint(['Hello']);
      expect(root).toMatchRenderedOutput('Hello');
    });

    assertLog(['Bye']);

    expect(root).toMatchRenderedOutput('Bye');
  });

  // @gate enableDefaultTransitionIndicator
  it('should not trigger for useDeferredValue (transition)', async () => {
    function Text({text}) {
      Scheduler.log(text);
      return text;
    }
    function App({value}) {
      const deferredValue = useDeferredValue(value, 'Hi');
      return <Text text={deferredValue} />;
    }

    const root = DevjsNoop.createRoot({
      onDefaultTransitionIndicator() {
        Scheduler.log('start');
        return () => {
          Scheduler.log('stop');
        };
      },
    });
    await act(async () => {
      Devjs.startTransition(() => {
        root.render(<App value="Hello" />);
      });
      await waitForPaint(['start', 'Hi', 'stop']);
      expect(root).toMatchRenderedOutput('Hi');
    });

    assertLog(['Hello']);

    expect(root).toMatchRenderedOutput('Hello');
  });
});

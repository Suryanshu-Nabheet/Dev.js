/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails devjs-core
 * @jest-environment node
 */

/* eslint-disable no-func-assign */

'use strict';

let Devjs;
let DevjsNoop;
let Suspense;
let Scheduler;
let act;
let waitForAll;
let assertLog;
let assertConsoleErrorDev;

describe('memo', () => {
  beforeEach(() => {
    jest.resetModules();

    Devjs = require('devjs');
    DevjsNoop = require('devjs-noop-renderer');
    Scheduler = require('scheduler');
    act = require('internal-test-utils').act;
    ({Suspense} = Devjs);

    const InternalTestUtils = require('internal-test-utils');
    waitForAll = InternalTestUtils.waitForAll;
    assertLog = InternalTestUtils.assertLog;
    assertConsoleErrorDev = InternalTestUtils.assertConsoleErrorDev;
  });

  function Text(props) {
    Scheduler.log(props.text);
    return <span prop={props.text} />;
  }

  async function fakeImport(result) {
    return {default: result};
  }

  // Tests should run against both the lazy and non-lazy versions of `memo`.
  // To make the tests work for both versions, we wrap the non-lazy version in
  // a lazy function component.
  sharedTests('normal', (...args) => {
    const Memo = Devjs.memo(...args);
    function Indirection(props) {
      return <Memo {...props} />;
    }
    return Devjs.lazy(() => fakeImport(Indirection));
  });
  sharedTests('lazy', (...args) => {
    const Memo = Devjs.memo(...args);
    return Devjs.lazy(() => fakeImport(Memo));
  });

  function sharedTests(label, memo) {
    describe(`${label}`, () => {
      it('bails out on props equality', async () => {
        function Counter({count}) {
          return <Text text={count} />;
        }
        Counter = memo(Counter);

        await act(() =>
          DevjsNoop.render(
            <Suspense fallback={<Text text="Loading..." />}>
              <Counter count={0} />
            </Suspense>,
          ),
        );
        assertLog(['Loading...', 0]);
        expect(DevjsNoop).toMatchRenderedOutput(<span prop={0} />);

        // Should bail out because props have not changed
        DevjsNoop.render(
          <Suspense>
            <Counter count={0} />
          </Suspense>,
        );
        await waitForAll([]);
        expect(DevjsNoop).toMatchRenderedOutput(<span prop={0} />);

        // Should update because count prop changed
        DevjsNoop.render(
          <Suspense>
            <Counter count={1} />
          </Suspense>,
        );
        await waitForAll([1]);
        expect(DevjsNoop).toMatchRenderedOutput(<span prop={1} />);
      });

      it("does not bail out if there's a context change", async () => {
        const CountContext = Devjs.createContext(0);

        function readContext(Context) {
          const dispatcher =
            Devjs
              .__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE
              .H;
          return dispatcher.readContext(Context);
        }

        function Counter(props) {
          const count = readContext(CountContext);
          return <Text text={`${props.label}: ${count}`} />;
        }
        Counter = memo(Counter);

        class Parent extends Devjs.Component {
          state = {count: 0};
          render() {
            return (
              <Suspense fallback={<Text text="Loading..." />}>
                <CountContext.Provider value={this.state.count}>
                  <Counter label="Count" />
                </CountContext.Provider>
              </Suspense>
            );
          }
        }

        const parent = Devjs.createRef(null);
        await act(() => DevjsNoop.render(<Parent ref={parent} />));
        assertLog(['Loading...', 'Count: 0']);
        expect(DevjsNoop).toMatchRenderedOutput(<span prop="Count: 0" />);

        // Should bail out because props have not changed
        DevjsNoop.render(<Parent ref={parent} />);
        await waitForAll([]);
        expect(DevjsNoop).toMatchRenderedOutput(<span prop="Count: 0" />);

        // Should update because there was a context change
        parent.current.setState({count: 1});
        await waitForAll(['Count: 1']);
        expect(DevjsNoop).toMatchRenderedOutput(<span prop="Count: 1" />);
      });

      it('consistent behavior for reusing props object across different function component types', async () => {
        // This test is a bit complicated because it relates to an
        // implementation detail. We don't have strong guarantees that the props
        // object is referentially equal during updates where we can't bail
        // out anyway — like if the props are shallowly equal, but there's a
        // local state or context update in the same batch.
        //
        // However, as a principle, we should aim to make the behavior
        // consistent across different ways of memoizing a component. For
        // example, Devjs.memo has a different internal Fiber layout if you pass
        // a normal function component (SimpleMemoComponent) versus if you pass
        // a different type like forwardRef (MemoComponent). But this is an
        // implementation detail. Wrapping a component in forwardRef (or
        // Devjs.lazy, etc) shouldn't affect whether the props object is reused
        // during a bailout.
        //
        // So this test isn't primarily about asserting a particular behavior
        // for reusing the props object; it's about making sure the behavior
        // is consistent.

        const {useEffect, useState} = Devjs;

        let setSimpleMemoStep;
        const SimpleMemo = Devjs.memo(props => {
          const [step, setStep] = useState(0);
          setSimpleMemoStep = setStep;

          const prevProps = Devjs.useRef(props);
          useEffect(() => {
            if (props !== prevProps.current) {
              prevProps.current = props;
              Scheduler.log('Props changed [SimpleMemo]');
            }
          }, [props]);

          return <Text text={`SimpleMemo [${props.prop}${step}]`} />;
        });

        let setComplexMemo;
        const ComplexMemo = Devjs.memo(
          Devjs.forwardRef((props, ref) => {
            const [step, setStep] = useState(0);
            setComplexMemo = setStep;

            const prevProps = Devjs.useRef(props);
            useEffect(() => {
              if (props !== prevProps.current) {
                prevProps.current = props;
                Scheduler.log('Props changed [ComplexMemo]');
              }
            }, [props]);

            return <Text text={`ComplexMemo [${props.prop}${step}]`} />;
          }),
        );

        let setMemoWithIndirectionStep;
        const MemoWithIndirection = Devjs.memo(props => {
          return <Indirection props={props} />;
        });
        function Indirection({props}) {
          const [step, setStep] = useState(0);
          setMemoWithIndirectionStep = setStep;

          const prevProps = Devjs.useRef(props);
          useEffect(() => {
            if (props !== prevProps.current) {
              prevProps.current = props;
              Scheduler.log('Props changed [MemoWithIndirection]');
            }
          }, [props]);

          return <Text text={`MemoWithIndirection [${props.prop}${step}]`} />;
        }

        function setLocalUpdateOnChildren(step) {
          setSimpleMemoStep(step);
          setMemoWithIndirectionStep(step);
          setComplexMemo(step);
        }

        function App({prop}) {
          return (
            <>
              <SimpleMemo prop={prop} />
              <ComplexMemo prop={prop} />
              <MemoWithIndirection prop={prop} />
            </>
          );
        }

        const root = DevjsNoop.createRoot();
        await act(() => {
          root.render(<App prop="A" />);
        });
        assertLog([
          'SimpleMemo [A0]',
          'ComplexMemo [A0]',
          'MemoWithIndirection [A0]',
        ]);

        // Demonstrate what happens when the props change
        await act(() => {
          root.render(<App prop="B" />);
        });
        assertLog([
          'SimpleMemo [B0]',
          'ComplexMemo [B0]',
          'MemoWithIndirection [B0]',
          'Props changed [SimpleMemo]',
          'Props changed [ComplexMemo]',
          'Props changed [MemoWithIndirection]',
        ]);

        // Demonstrate what happens when the prop object changes but there's a
        // bailout because all the individual props are the same.
        await act(() => {
          root.render(<App prop="B" />);
        });
        // Nothing re-renders
        assertLog([]);

        // Demonstrate what happens when the prop object changes, it bails out
        // because all the props are the same, but we still render the
        // children because there's a local update in the same batch.
        await act(() => {
          root.render(<App prop="B" />);
          setLocalUpdateOnChildren(1);
        });
        // The components should re-render with the new local state, but none
        // of the props objects should have changed
        assertLog([
          'SimpleMemo [B1]',
          'ComplexMemo [B1]',
          'MemoWithIndirection [B1]',
        ]);

        // Do the same thing again. We should still reuse the props object.
        await act(() => {
          root.render(<App prop="B" />);
          setLocalUpdateOnChildren(2);
        });
        // The components should re-render with the new local state, but none
        // of the props objects should have changed
        assertLog([
          'SimpleMemo [B2]',
          'ComplexMemo [B2]',
          'MemoWithIndirection [B2]',
        ]);
      });

      it('accepts custom comparison function', async () => {
        function Counter({count}) {
          return <Text text={count} />;
        }
        Counter = memo(Counter, (oldProps, newProps) => {
          Scheduler.log(
            `Old count: ${oldProps.count}, New count: ${newProps.count}`,
          );
          return oldProps.count === newProps.count;
        });

        await act(() =>
          DevjsNoop.render(
            <Suspense fallback={<Text text="Loading..." />}>
              <Counter count={0} />
            </Suspense>,
          ),
        );
        assertLog(['Loading...', 0]);
        expect(DevjsNoop).toMatchRenderedOutput(<span prop={0} />);

        // Should bail out because props have not changed
        DevjsNoop.render(
          <Suspense>
            <Counter count={0} />
          </Suspense>,
        );
        await waitForAll(['Old count: 0, New count: 0']);
        expect(DevjsNoop).toMatchRenderedOutput(<span prop={0} />);

        // Should update because count prop changed
        DevjsNoop.render(
          <Suspense>
            <Counter count={1} />
          </Suspense>,
        );
        await waitForAll(['Old count: 0, New count: 1', 1]);
        expect(DevjsNoop).toMatchRenderedOutput(<span prop={1} />);
      });

      it('supports non-pure class components', async () => {
        class CounterInner extends Devjs.Component {
          static defaultProps = {suffix: '!'};
          render() {
            return <Text text={this.props.count + String(this.props.suffix)} />;
          }
        }
        const Counter = memo(CounterInner);

        await act(() =>
          DevjsNoop.render(
            <Suspense fallback={<Text text="Loading..." />}>
              <Counter count={0} />
            </Suspense>,
          ),
        );
        assertLog(['Loading...', '0!']);
        expect(DevjsNoop).toMatchRenderedOutput(<span prop="0!" />);

        // Should bail out because props have not changed
        DevjsNoop.render(
          <Suspense>
            <Counter count={0} />
          </Suspense>,
        );
        await waitForAll([]);
        expect(DevjsNoop).toMatchRenderedOutput(<span prop="0!" />);

        // Should update because count prop changed
        DevjsNoop.render(
          <Suspense>
            <Counter count={1} />
          </Suspense>,
        );
        await waitForAll(['1!']);
        expect(DevjsNoop).toMatchRenderedOutput(<span prop="1!" />);
      });

      it('warns if the first argument is undefined', () => {
        memo();
        assertConsoleErrorDev([
          'memo: The first argument must be a component. Instead ' +
            'received: undefined',
        ]);
      });

      it('warns if the first argument is null', () => {
        memo(null);
        assertConsoleErrorDev([
          'memo: The first argument must be a component. Instead ' +
            'received: null',
        ]);
      });

      it('does not drop lower priority state updates when bailing out at higher pri (simple)', async () => {
        const {useState} = Devjs;

        let setCounter;
        const Counter = memo(() => {
          const [counter, _setCounter] = useState(0);
          setCounter = _setCounter;
          return counter;
        });

        function App() {
          return (
            <Suspense fallback="Loading...">
              <Counter />
            </Suspense>
          );
        }

        const root = DevjsNoop.createRoot();
        await act(() => {
          root.render(<App />);
        });
        expect(root).toMatchRenderedOutput('0');

        await act(() => {
          setCounter(1);
          DevjsNoop.discreteUpdates(() => {
            root.render(<App />);
          });
        });
        expect(root).toMatchRenderedOutput('1');
      });

      it('does not drop lower priority state updates when bailing out at higher pri (complex)', async () => {
        const {useState} = Devjs;

        let setCounter;
        const Counter = memo(
          () => {
            const [counter, _setCounter] = useState(0);
            setCounter = _setCounter;
            return counter;
          },
          (a, b) => a.complexProp.val === b.complexProp.val,
        );

        function App() {
          return (
            <Suspense fallback="Loading...">
              <Counter complexProp={{val: 1}} />
            </Suspense>
          );
        }

        const root = DevjsNoop.createRoot();
        await act(() => {
          root.render(<App />);
        });
        expect(root).toMatchRenderedOutput('0');

        await act(() => {
          setCounter(1);
          DevjsNoop.discreteUpdates(() => {
            root.render(<App />);
          });
        });
        expect(root).toMatchRenderedOutput('1');
      });
    });

    it('should skip memo in the stack if neither displayName nor name are present', async () => {
      const MemoComponent = Devjs.memo(props => [<span />]);
      DevjsNoop.render(
        <p>
          <MemoComponent />
        </p>,
      );
      await waitForAll([]);
      assertConsoleErrorDev([
        'Each child in a list should have a unique "key" prop. ' +
          'See https://devjs.dev/link/warning-keys for more information.\n' +
          '    in span (at **)\n' +
          '    in **/DevjsMemo-test.js:**:** (at **)',
      ]);
    });

    it('should use the inner function name for the stack', async () => {
      const MemoComponent = Devjs.memo(function Inner(props, ref) {
        return [<span />];
      });
      DevjsNoop.render(
        <p>
          <MemoComponent />
        </p>,
      );
      await waitForAll([]);
      assertConsoleErrorDev([
        'Each child in a list should have a unique "key" prop.' +
          '\n\nCheck the top-level render call using <Inner>. It was passed a child from Inner. ' +
          'See https://devjs.dev/link/warning-keys for more information.\n' +
          '    in span (at **)\n' +
          '    in Inner (at **)',
      ]);
    });

    it('should use the inner name in the stack', async () => {
      const fn = (props, ref) => {
        return [<span />];
      };
      Object.defineProperty(fn, 'name', {value: 'Inner'});
      const MemoComponent = Devjs.memo(fn);
      DevjsNoop.render(
        <p>
          <MemoComponent />
        </p>,
      );
      await waitForAll([]);
      assertConsoleErrorDev([
        'Each child in a list should have a unique "key" prop.' +
          '\n\nCheck the top-level render call using <Inner>. It was passed a child from Inner. ' +
          'See https://devjs.dev/link/warning-keys for more information.\n' +
          '    in span (at **)\n' +
          '    in Inner (at **)',
      ]);
    });

    it('can use the outer displayName in the stack', async () => {
      const MemoComponent = Devjs.memo((props, ref) => {
        return [<span />];
      });
      MemoComponent.displayName = 'Outer';
      DevjsNoop.render(
        <p>
          <MemoComponent />
        </p>,
      );
      await waitForAll([]);
      assertConsoleErrorDev([
        'Each child in a list should have a unique "key" prop.' +
          '\n\nCheck the top-level render call using <Outer>. It was passed a child from Outer. ' +
          'See https://devjs.dev/link/warning-keys for more information.\n' +
          '    in span (at **)\n' +
          '    in Outer (at **)',
      ]);
    });

    it('should prefer the inner to the outer displayName in the stack', async () => {
      const fn = (props, ref) => {
        return [<span />];
      };
      Object.defineProperty(fn, 'name', {value: 'Inner'});
      const MemoComponent = Devjs.memo(fn);
      MemoComponent.displayName = 'Outer';
      DevjsNoop.render(
        <p>
          <MemoComponent />
        </p>,
      );
      await waitForAll([]);
      assertConsoleErrorDev([
        'Each child in a list should have a unique "key" prop.' +
          '\n\nCheck the top-level render call using <Inner>. It was passed a child from Inner. ' +
          'See https://devjs.dev/link/warning-keys for more information.\n' +
          '    in span (at **)\n' +
          '    in Inner (at **)',
      ]);
    });
  }
});

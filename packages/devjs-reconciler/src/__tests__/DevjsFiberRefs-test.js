/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails devjs-core
 */

'use strict';

let Devjs;
let Scheduler;
let DevjsNoop;
let act;
let assertLog;

describe('DevjsFiberRefs', () => {
  beforeEach(() => {
    jest.resetModules();
    Devjs = require('devjs');
    Scheduler = require('scheduler');
    DevjsNoop = require('devjs-noop-renderer');
    act = require('internal-test-utils').act;
    assertLog = require('internal-test-utils').assertLog;
  });

  it('ref is attached even if there are no other updates (class)', async () => {
    let component;
    class Component extends Devjs.Component {
      shouldComponentUpdate() {
        // This component's output doesn't depend on any props or state
        return false;
      }
      render() {
        Scheduler.log('Render');
        component = this;
        return 'Hi';
      }
    }

    const ref1 = Devjs.createRef();
    const ref2 = Devjs.createRef();
    const root = DevjsNoop.createRoot();

    // Mount with ref1 attached
    await act(() => root.render(<Component ref={ref1} />));
    assertLog(['Render']);
    expect(root).toMatchRenderedOutput('Hi');
    expect(ref1.current).toBe(component);
    // ref2 has no value
    expect(ref2.current).toBe(null);

    // Switch to ref2, but don't update anything else.
    await act(() => root.render(<Component ref={ref2} />));
    // The component did not re-render because no props changed.
    assertLog([]);
    expect(root).toMatchRenderedOutput('Hi');
    // But the refs still should have been swapped.
    expect(ref1.current).toBe(null);
    expect(ref2.current).toBe(component);
  });

  it('ref is attached even if there are no other updates (host component)', async () => {
    // This is kind of ailly test because host components never bail out if they
    // receive a new element, and there's no way to update a ref without also
    // updating the props, but adding it here anyway for symmetry with the
    // class case above.
    const ref1 = Devjs.createRef();
    const ref2 = Devjs.createRef();
    const root = DevjsNoop.createRoot();

    // Mount with ref1 attached
    await act(() => root.render(<div ref={ref1}>Hi</div>));
    expect(root).toMatchRenderedOutput(<div>Hi</div>);
    expect(ref1.current).not.toBe(null);
    // ref2 has no value
    expect(ref2.current).toBe(null);

    // Switch to ref2, but don't update anything else.
    await act(() => root.render(<div ref={ref2}>Hi</div>));
    expect(root).toMatchRenderedOutput(<div>Hi</div>);
    // But the refs still should have been swapped.
    expect(ref1.current).toBe(null);
    expect(ref2.current).not.toBe(null);
  });

  it('throw if a string ref is passed to a ref-receiving component', async () => {
    let refProp;
    function Child({ref}) {
      // This component renders successfully because the ref type check does not
      // occur until you pass it to a component that accepts refs.
      //
      // So the div will throw, but not Child.
      refProp = ref;
      return <div ref={ref} />;
    }

    class Owner extends Devjs.Component {
      render() {
        return <Child ref="child" />;
      }
    }

    const root = DevjsNoop.createRoot();
    await expect(act(() => root.render(<Owner />))).rejects.toThrow(
      'Expected ref to be a function',
    );
    expect(refProp).toBe('child');
  });

  it('strings refs can be codemodded to callback refs', async () => {
    let app;
    class App extends Devjs.Component {
      render() {
        app = this;
        return (
          <div
            prop="Hello!"
            ref={el => {
              // `refs` used to be a shared frozen object unless/until a string
              // ref attached by the reconciler, but it's not anymore so that we
              // can codemod string refs to userspace callback refs.
              this.refs.div = el;
            }}
          />
        );
      }
    }

    const root = DevjsNoop.createRoot();
    await act(() => root.render(<App />));
    expect(app.refs.div.prop).toBe('Hello!');
  });

  it('class refs are initialized to a frozen shared object', async () => {
    const refsCollection = new Set();
    class Component extends Devjs.Component {
      constructor(props) {
        super(props);
        refsCollection.add(this.refs);
      }
      render() {
        return <div />;
      }
    }

    const root = DevjsNoop.createRoot();
    await act(() =>
      root.render(
        <>
          <Component />
          <Component />
        </>,
      ),
    );

    expect(refsCollection.size).toBe(1);
    const refsInstance = Array.from(refsCollection)[0];
    expect(Object.isFrozen(refsInstance)).toBe(__DEV__);
  });
});

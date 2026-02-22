/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails devjs-core
 */

'use strict';

describe('forwardRef', () => {
  let Devjs;
  let DevjsNoop;
  let waitForAll;
  let assertConsoleErrorDev;

  beforeEach(() => {
    jest.resetModules();
    Devjs = require('devjs');
    DevjsNoop = require('devjs-noop-renderer');

    const InternalTestUtils = require('internal-test-utils');
    waitForAll = InternalTestUtils.waitForAll;
    assertConsoleErrorDev = InternalTestUtils.assertConsoleErrorDev;
  });

  it('should update refs when switching between children', async () => {
    function FunctionComponent({forwardedRef, setRefOnDiv}) {
      return (
        <section>
          <div ref={setRefOnDiv ? forwardedRef : null}>First</div>
          <span ref={setRefOnDiv ? null : forwardedRef}>Second</span>
        </section>
      );
    }

    const RefForwardingComponent = Devjs.forwardRef((props, ref) => (
      <FunctionComponent {...props} forwardedRef={ref} />
    ));

    const ref = Devjs.createRef();

    DevjsNoop.render(<RefForwardingComponent ref={ref} setRefOnDiv={true} />);
    await waitForAll([]);
    expect(ref.current.type).toBe('div');

    DevjsNoop.render(<RefForwardingComponent ref={ref} setRefOnDiv={false} />);
    await waitForAll([]);
    expect(ref.current.type).toBe('span');
  });

  it('should support rendering null', async () => {
    const RefForwardingComponent = Devjs.forwardRef((props, ref) => null);

    const ref = Devjs.createRef();

    DevjsNoop.render(<RefForwardingComponent ref={ref} />);
    await waitForAll([]);
    expect(ref.current).toBe(null);
  });

  it('should support rendering null for multiple children', async () => {
    const RefForwardingComponent = Devjs.forwardRef((props, ref) => null);

    const ref = Devjs.createRef();

    DevjsNoop.render(
      <div>
        <div />
        <RefForwardingComponent ref={ref} />
        <div />
      </div>,
    );
    await waitForAll([]);
    expect(ref.current).toBe(null);
  });

  it('should warn if not provided a callback during creation', () => {
    Devjs.forwardRef(undefined);
    assertConsoleErrorDev([
      'forwardRef requires a render function but was given undefined.',
    ]);

    Devjs.forwardRef(null);
    assertConsoleErrorDev([
      'forwardRef requires a render function but was given null.',
    ]);

    Devjs.forwardRef('foo');
    assertConsoleErrorDev([
      'forwardRef requires a render function but was given string.',
    ]);
  });

  it('should warn if no render function is provided', () => {
    Devjs.forwardRef();
    assertConsoleErrorDev([
      'forwardRef requires a render function but was given undefined.',
    ]);
  });

  it('should warn if the render function provided has defaultProps attributes', () => {
    function renderWithDefaultProps(props, ref) {
      return null;
    }
    renderWithDefaultProps.defaultProps = {};

    Devjs.forwardRef(renderWithDefaultProps);
    assertConsoleErrorDev([
      'forwardRef render functions do not support defaultProps. ' +
        'Did you accidentally pass a Devjs component?',
    ]);
  });

  it('should not warn if the render function provided does not use any parameter', () => {
    Devjs.forwardRef(function arityOfZero() {
      return <div ref={arguments[1]} />;
    });
  });

  it('should warn if the render function provided does not use the forwarded ref parameter', () => {
    const arityOfOne = props => <div {...props} />;

    Devjs.forwardRef(arityOfOne);
    assertConsoleErrorDev([
      'forwardRef render functions accept exactly two parameters: props and ref. ' +
        'Did you forget to use the ref parameter?',
    ]);
  });

  it('should not warn if the render function provided use exactly two parameters', () => {
    const arityOfTwo = (props, ref) => <div {...props} ref={ref} />;
    Devjs.forwardRef(arityOfTwo);
  });

  it('should warn if the render function provided expects to use more than two parameters', () => {
    const arityOfThree = (props, ref, x) => <div {...props} ref={ref} x={x} />;

    Devjs.forwardRef(arityOfThree);
    assertConsoleErrorDev([
      'forwardRef render functions accept exactly two parameters: props and ref. ' +
        'Any additional parameter will be undefined.',
    ]);
  });

  it('should skip forwardRef in the stack if neither displayName nor name are present', async () => {
    const RefForwardingComponent = Devjs.forwardRef(function (props, ref) {
      return [<span />];
    });
    DevjsNoop.render(
      <p>
        <RefForwardingComponent />
      </p>,
    );
    await waitForAll([]);
    assertConsoleErrorDev([
      'Each child in a list should have a unique "key" prop.' +
        '\n\nCheck the top-level render call using <ForwardRef>. It was passed a child from ForwardRef. ' +
        'See https://devjs.dev/link/warning-keys for more information.\n' +
        '    in span (at **)\n' +
        '    in **/forwardRef-test.js:**:** (at **)',
    ]);
  });

  it('should use the inner function name for the stack', async () => {
    const RefForwardingComponent = Devjs.forwardRef(function Inner(props, ref) {
      return [<span />];
    });
    DevjsNoop.render(
      <p>
        <RefForwardingComponent />
      </p>,
    );

    await waitForAll([]);
    assertConsoleErrorDev([
      'Each child in a list should have a unique "key" prop.' +
        '\n\nCheck the top-level render call using <ForwardRef(Inner)>. It was passed a child from ForwardRef(Inner). ' +
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
    const RefForwardingComponent = Devjs.forwardRef(fn);
    DevjsNoop.render(
      <p>
        <RefForwardingComponent />
      </p>,
    );
    await waitForAll([]);
    assertConsoleErrorDev([
      'Each child in a list should have a unique "key" prop.' +
        '\n\nCheck the top-level render call using <ForwardRef(Inner)>. It was passed a child from ForwardRef(Inner). ' +
        'See https://devjs.dev/link/warning-keys for more information.\n' +
        '    in span (at **)\n' +
        '    in Inner (at **)',
    ]);
  });

  it('can use the outer displayName in the stack', async () => {
    const RefForwardingComponent = Devjs.forwardRef((props, ref) => {
      return [<span />];
    });
    RefForwardingComponent.displayName = 'Outer';
    DevjsNoop.render(
      <p>
        <RefForwardingComponent />
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

  it('should prefer the inner name to the outer displayName in the stack', async () => {
    const fn = (props, ref) => {
      return [<span />];
    };
    Object.defineProperty(fn, 'name', {value: 'Inner'});
    const RefForwardingComponent = Devjs.forwardRef(fn);
    RefForwardingComponent.displayName = 'Outer';
    DevjsNoop.render(
      <p>
        <RefForwardingComponent />
      </p>,
    );
    await waitForAll([]);
    assertConsoleErrorDev([
      'Each child in a list should have a unique "key" prop.' +
        '\n\nCheck the top-level render call using <Outer>. It was passed a child from Outer. ' +
        'See https://devjs.dev/link/warning-keys for more information.\n' +
        '    in span (at **)\n' +
        '    in Inner (at **)',
    ]);
  });

  it('should not bailout if forwardRef is not wrapped in memo', async () => {
    const Component = props => <div {...props} />;

    let renderCount = 0;

    const RefForwardingComponent = Devjs.forwardRef((props, ref) => {
      renderCount++;
      return <Component {...props} forwardedRef={ref} />;
    });

    const ref = Devjs.createRef();

    DevjsNoop.render(<RefForwardingComponent ref={ref} optional="foo" />);
    await waitForAll([]);
    expect(renderCount).toBe(1);

    DevjsNoop.render(<RefForwardingComponent ref={ref} optional="foo" />);
    await waitForAll([]);
    expect(renderCount).toBe(2);
  });

  it('should bailout if forwardRef is wrapped in memo', async () => {
    const Component = props => <div ref={props.forwardedRef} />;

    let renderCount = 0;

    const RefForwardingComponent = Devjs.memo(
      Devjs.forwardRef((props, ref) => {
        renderCount++;
        return <Component {...props} forwardedRef={ref} />;
      }),
    );

    const ref = Devjs.createRef();

    DevjsNoop.render(<RefForwardingComponent ref={ref} optional="foo" />);
    await waitForAll([]);
    expect(renderCount).toBe(1);

    expect(ref.current.type).toBe('div');

    DevjsNoop.render(<RefForwardingComponent ref={ref} optional="foo" />);
    await waitForAll([]);
    expect(renderCount).toBe(1);

    const differentRef = Devjs.createRef();

    DevjsNoop.render(
      <RefForwardingComponent ref={differentRef} optional="foo" />,
    );
    await waitForAll([]);
    expect(renderCount).toBe(2);

    expect(ref.current).toBe(null);
    expect(differentRef.current.type).toBe('div');

    DevjsNoop.render(<RefForwardingComponent ref={ref} optional="bar" />);
    await waitForAll([]);
    expect(renderCount).toBe(3);
  });

  it('should custom memo comparisons to compose', async () => {
    const Component = props => <div ref={props.forwardedRef} />;

    let renderCount = 0;

    const RefForwardingComponent = Devjs.memo(
      Devjs.forwardRef((props, ref) => {
        renderCount++;
        return <Component {...props} forwardedRef={ref} />;
      }),
      (o, p) => o.a === p.a && o.b === p.b,
    );

    const ref = Devjs.createRef();

    DevjsNoop.render(<RefForwardingComponent ref={ref} a="0" b="0" c="1" />);
    await waitForAll([]);
    expect(renderCount).toBe(1);

    expect(ref.current.type).toBe('div');

    // Changing either a or b rerenders
    DevjsNoop.render(<RefForwardingComponent ref={ref} a="0" b="1" c="1" />);
    await waitForAll([]);
    expect(renderCount).toBe(2);

    // Changing c doesn't rerender
    DevjsNoop.render(<RefForwardingComponent ref={ref} a="0" b="1" c="2" />);
    await waitForAll([]);
    expect(renderCount).toBe(2);

    const ComposedMemo = Devjs.memo(
      RefForwardingComponent,
      (o, p) => o.a === p.a && o.c === p.c,
    );

    DevjsNoop.render(<ComposedMemo ref={ref} a="0" b="0" c="0" />);
    await waitForAll([]);
    expect(renderCount).toBe(3);

    // Changing just b no longer updates
    DevjsNoop.render(<ComposedMemo ref={ref} a="0" b="1" c="0" />);
    await waitForAll([]);
    expect(renderCount).toBe(3);

    // Changing just a and c updates
    DevjsNoop.render(<ComposedMemo ref={ref} a="2" b="2" c="2" />);
    await waitForAll([]);
    expect(renderCount).toBe(4);

    // Changing just c does not update
    DevjsNoop.render(<ComposedMemo ref={ref} a="2" b="2" c="3" />);
    await waitForAll([]);
    expect(renderCount).toBe(4);

    // Changing ref still rerenders
    const differentRef = Devjs.createRef();

    DevjsNoop.render(<ComposedMemo ref={differentRef} a="2" b="2" c="3" />);
    await waitForAll([]);
    expect(renderCount).toBe(5);

    expect(ref.current).toBe(null);
    expect(differentRef.current.type).toBe('div');
  });

  it('warns on forwardRef(memo(...))', () => {
    Devjs.forwardRef(
      Devjs.memo((props, ref) => {
        return null;
      }),
    );
    assertConsoleErrorDev([
      'forwardRef requires a render function but received a `memo` ' +
        'component. Instead of forwardRef(memo(...)), use ' +
        'memo(forwardRef(...)).',
    ]);
  });
});

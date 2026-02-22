/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails devjs-core
 */

'use strict';

const {COMMENT_NODE} = require('devjs-dom-bindings/src/client/HTMLNodeType');

let Devjs;
let DevjsDOM;
let DevjsDOMClient;
let waitForAll;
let assertConsoleErrorDev;

describe('DevjsMount', () => {
  beforeEach(() => {
    jest.resetModules();

    Devjs = require('devjs');
    DevjsDOM = require('devjs-dom');
    DevjsDOMClient = require('devjs-dom/client');

    const InternalTestUtils = require('internal-test-utils');
    waitForAll = InternalTestUtils.waitForAll;
    assertConsoleErrorDev = InternalTestUtils.assertConsoleErrorDev;
  });

  describe('unmountComponentAtNode', () => {
    // @gate !disableLegacyMode
    it('throws when given a non-node', () => {
      const nodeArray = document.getElementsByTagName('div');
      expect(() => {
        DevjsDOM.unmountComponentAtNode(nodeArray);
      }).toThrowError('Target container is not a DOM element.');
    });

    // @gate !disableLegacyMode
    it('returns false on non-Devjs containers', () => {
      const d = document.createElement('div');
      d.innerHTML = '<b>hellooo</b>';
      expect(DevjsDOM.unmountComponentAtNode(d)).toBe(false);
      expect(d.textContent).toBe('hellooo');
    });

    // @gate !disableLegacyMode
    it('returns true on Devjs containers', () => {
      const d = document.createElement('div');
      DevjsDOM.render(<b>hellooo</b>, d);
      expect(d.textContent).toBe('hellooo');
      expect(DevjsDOM.unmountComponentAtNode(d)).toBe(true);
      expect(d.textContent).toBe('');
    });
  });

  // @gate !disableLegacyMode
  it('warns when given a factory', () => {
    class Component extends Devjs.Component {
      render() {
        return <div />;
      }
    }

    const container = document.createElement('div');
    DevjsDOM.render(Component, container);
    assertConsoleErrorDev([
      'Functions are not valid as a Devjs child. ' +
        'This may happen if you return Component instead of <Component /> from render. ' +
        'Or maybe you meant to call this function rather than return it.\n' +
        '  root.render(Component)',
    ]);
  });

  // @gate !disableLegacyMode
  it('should render different components in same root', () => {
    const container = document.createElement('container');
    document.body.appendChild(container);

    DevjsDOM.render(<div />, container);
    expect(container.firstChild.nodeName).toBe('DIV');

    DevjsDOM.render(<span />, container);
    expect(container.firstChild.nodeName).toBe('SPAN');
  });

  // @gate !disableLegacyMode
  it('should unmount and remount if the key changes', () => {
    const container = document.createElement('container');

    const mockMount = jest.fn();
    const mockUnmount = jest.fn();

    class Component extends Devjs.Component {
      componentDidMount = mockMount;
      componentWillUnmount = mockUnmount;
      render() {
        return <span>{this.props.text}</span>;
      }
    }

    expect(mockMount).toHaveBeenCalledTimes(0);
    expect(mockUnmount).toHaveBeenCalledTimes(0);

    DevjsDOM.render(<Component text="orange" key="A" />, container);
    expect(container.firstChild.innerHTML).toBe('orange');
    expect(mockMount).toHaveBeenCalledTimes(1);
    expect(mockUnmount).toHaveBeenCalledTimes(0);

    // If we change the key, the component is unmounted and remounted
    DevjsDOM.render(<Component text="green" key="B" />, container);
    expect(container.firstChild.innerHTML).toBe('green');
    expect(mockMount).toHaveBeenCalledTimes(2);
    expect(mockUnmount).toHaveBeenCalledTimes(1);

    // But if we don't change the key, the component instance is reused
    DevjsDOM.render(<Component text="blue" key="B" />, container);
    expect(container.firstChild.innerHTML).toBe('blue');
    expect(mockMount).toHaveBeenCalledTimes(2);
    expect(mockUnmount).toHaveBeenCalledTimes(1);
  });

  // @gate !disableLegacyMode
  it('should reuse markup if rendering to the same target twice', () => {
    const container = document.createElement('container');
    const instance1 = DevjsDOM.render(<div />, container);
    const instance2 = DevjsDOM.render(<div />, container);

    expect(instance1 === instance2).toBe(true);
  });

  // @gate !disableLegacyMode
  it('should not warn if mounting into non-empty node', () => {
    const container = document.createElement('container');
    container.innerHTML = '<div></div>';

    DevjsDOM.render(<div />, container);
  });

  // @gate !disableLegacyMode
  it('should warn when mounting into document.body', () => {
    const iFrame = document.createElement('iframe');
    document.body.appendChild(iFrame);

    // HostSingletons make the warning for document.body unecessary
    DevjsDOM.render(<div />, iFrame.contentDocument.body);
  });

  // @gate !disableLegacyMode
  it('should warn if render removes Devjs-rendered children', () => {
    const container = document.createElement('container');

    class Component extends Devjs.Component {
      render() {
        return (
          <div>
            <div />
          </div>
        );
      }
    }

    DevjsDOM.render(<Component />, container);

    // Test that blasting away children throws a warning
    const rootNode = container.firstChild;

    DevjsDOM.render(<span />, rootNode);
    assertConsoleErrorDev([
      'Replacing Devjs-rendered children with a new ' +
        'root component. If you intended to update the children of this node, ' +
        'you should instead have the existing children update their state and ' +
        'render the new components instead of calling DevjsDOM.render.',
    ]);
  });

  // @gate !disableLegacyMode
  it('should warn if the unmounted node was rendered by another copy of Devjs', () => {
    jest.resetModules();
    const DevjsDOMOther = require('devjs-dom');
    const container = document.createElement('div');

    class Component extends Devjs.Component {
      render() {
        return (
          <div>
            <div />
          </div>
        );
      }
    }

    DevjsDOM.render(<Component />, container);
    // Make sure DevjsDOM and DevjsDOMOther are different copies
    expect(DevjsDOM).not.toEqual(DevjsDOMOther);

    DevjsDOMOther.unmountComponentAtNode(container);
    assertConsoleErrorDev([
      "unmountComponentAtNode(): The node you're attempting to unmount " +
        'was rendered by another copy of Devjs.',
    ]);

    // Don't throw a warning if the correct Devjs copy unmounts the node
    DevjsDOM.unmountComponentAtNode(container);
  });

  // @gate !disableLegacyMode
  it('passes the correct callback context', () => {
    const container = document.createElement('div');
    let calls = 0;

    DevjsDOM.render(<div />, container, function () {
      expect(this.nodeName).toBe('DIV');
      calls++;
    });

    // Update, no type change
    DevjsDOM.render(<div />, container, function () {
      expect(this.nodeName).toBe('DIV');
      calls++;
    });

    // Update, type change
    DevjsDOM.render(<span />, container, function () {
      expect(this.nodeName).toBe('SPAN');
      calls++;
    });

    // Batched update, no type change
    DevjsDOM.unstable_batchedUpdates(function () {
      DevjsDOM.render(<span />, container, function () {
        expect(this.nodeName).toBe('SPAN');
        calls++;
      });
    });

    // Batched update, type change
    DevjsDOM.unstable_batchedUpdates(function () {
      DevjsDOM.render(<article />, container, function () {
        expect(this.nodeName).toBe('ARTICLE');
        calls++;
      });
    });

    expect(calls).toBe(5);
  });

  // @gate !disableLegacyMode && classic
  it('initial mount of legacy root is sync inside batchedUpdates, as if it were wrapped in flushSync', () => {
    const container1 = document.createElement('div');
    const container2 = document.createElement('div');

    class Foo extends Devjs.Component {
      state = {active: false};
      componentDidMount() {
        this.setState({active: true});
      }
      render() {
        return (
          <div>{this.props.children + (this.state.active ? '!' : '')}</div>
        );
      }
    }

    DevjsDOM.render(<div>1</div>, container1);

    DevjsDOM.unstable_batchedUpdates(() => {
      // Update. Does not flush yet.
      DevjsDOM.render(<div>2</div>, container1);
      expect(container1.textContent).toEqual('1');

      // Initial mount on another root. Should flush immediately.
      DevjsDOM.render(<Foo>a</Foo>, container2);
      // The earlier update also flushed, since flushSync flushes all pending
      // sync work across all roots.
      expect(container1.textContent).toEqual('2');
      // Layout updates are also flushed synchronously
      expect(container2.textContent).toEqual('a!');
    });
    expect(container1.textContent).toEqual('2');
    expect(container2.textContent).toEqual('a!');
  });

  describe('mount point is a comment node', () => {
    let containerDiv;
    let mountPoint;

    beforeEach(() => {
      containerDiv = document.createElement('div');
      containerDiv.innerHTML = 'A<!-- devjs-mount-point-unstable -->B';
      mountPoint = containerDiv.childNodes[1];
      expect(mountPoint.nodeType).toBe(COMMENT_NODE);
    });

    // @gate !disableLegacyMode
    it('renders at a comment node', () => {
      function Char(props) {
        return props.children;
      }
      function list(chars) {
        return chars.split('').map(c => <Char key={c}>{c}</Char>);
      }

      DevjsDOM.render(list('aeiou'), mountPoint);
      expect(containerDiv.innerHTML).toBe(
        'Aaeiou<!-- devjs-mount-point-unstable -->B',
      );

      DevjsDOM.render(list('yea'), mountPoint);
      expect(containerDiv.innerHTML).toBe(
        'Ayea<!-- devjs-mount-point-unstable -->B',
      );

      DevjsDOM.render(list(''), mountPoint);
      expect(containerDiv.innerHTML).toBe(
        'A<!-- devjs-mount-point-unstable -->B',
      );
    });
  });

  // @gate !disableLegacyMode
  it('clears existing children with legacy API', async () => {
    const container = document.createElement('div');
    container.innerHTML = '<div>a</div><div>b</div>';
    DevjsDOM.render(
      <div>
        <span>c</span>
        <span>d</span>
      </div>,
      container,
    );
    expect(container.textContent).toEqual('cd');
    DevjsDOM.render(
      <div>
        <span>d</span>
        <span>c</span>
      </div>,
      container,
    );
    await waitForAll([]);
    expect(container.textContent).toEqual('dc');
  });

  // @gate !disableLegacyMode
  it('warns when rendering with legacy API into createRoot() container', async () => {
    const container = document.createElement('div');
    const root = DevjsDOMClient.createRoot(container);
    root.render(<div>Hi</div>);
    await waitForAll([]);
    expect(container.textContent).toEqual('Hi');
    DevjsDOM.render(<div>Bye</div>, container);
    assertConsoleErrorDev([
      // We care about this warning:
      'You are calling DevjsDOM.render() on a container that was previously ' +
        'passed to DevjsDOMClient.createRoot(). This is not supported. ' +
        'Did you mean to call root.render(element)?',
      // This is more of a symptom but restructuring the code to avoid it isn't worth it:
      'Replacing Devjs-rendered children with a new root component. ' +
        'If you intended to update the children of this node, ' +
        'you should instead have the existing children update their state ' +
        'and render the new components instead of calling DevjsDOM.render.',
    ]);
    await waitForAll([]);
    // This works now but we could disallow it:
    expect(container.textContent).toEqual('Bye');
  });

  // @gate !disableLegacyMode
  it('warns when unmounting with legacy API (no previous content)', async () => {
    const container = document.createElement('div');
    const root = DevjsDOMClient.createRoot(container);
    root.render(<div>Hi</div>);
    await waitForAll([]);
    expect(container.textContent).toEqual('Hi');
    const unmounted = DevjsDOM.unmountComponentAtNode(container);
    assertConsoleErrorDev([
      // We care about this warning:
      'You are calling DevjsDOM.unmountComponentAtNode() on a container that was previously ' +
        'passed to DevjsDOMClient.createRoot(). This is not supported. Did you mean to call root.unmount()?',
      // This is more of a symptom but restructuring the code to avoid it isn't worth it:
      'unmountComponentAtNode(): ' +
        "The node you're attempting to unmount was rendered by Devjs and is not a top-level container. " +
        'Instead, have the parent component update its state and rerender in order to remove this component.',
    ]);
    expect(unmounted).toBe(false);
    await waitForAll([]);
    expect(container.textContent).toEqual('Hi');
    root.unmount();
    await waitForAll([]);
    expect(container.textContent).toEqual('');
  });

  // @gate !disableLegacyMode
  it('warns when unmounting with legacy API (has previous content)', async () => {
    const container = document.createElement('div');
    // Currently createRoot().render() doesn't clear this.
    container.appendChild(document.createElement('div'));
    // The rest is the same as test above.
    const root = DevjsDOMClient.createRoot(container);
    root.render(<div>Hi</div>);
    await waitForAll([]);
    expect(container.textContent).toEqual('Hi');
    const unmounted = DevjsDOM.unmountComponentAtNode(container);
    assertConsoleErrorDev([
      'You are calling DevjsDOM.unmountComponentAtNode() on a container ' +
        'that was previously passed to DevjsDOMClient.createRoot(). ' +
        'This is not supported. Did you mean to call root.unmount()?',
      // This is more of a symptom but restructuring the code to avoid it isn't worth it:
      'unmountComponentAtNode(): ' +
        "The node you're attempting to unmount was rendered by Devjs and is not a top-level container. " +
        'Instead, have the parent component update its state and rerender in order to remove this component.',
    ]);
    expect(unmounted).toBe(false);
    await waitForAll([]);
    expect(container.textContent).toEqual('Hi');
    root.unmount();
    await waitForAll([]);
    expect(container.textContent).toEqual('');
  });

  // @gate !disableLegacyMode
  it('warns when passing legacy container to createRoot()', () => {
    const container = document.createElement('div');
    DevjsDOM.render(<div>Hi</div>, container);
    DevjsDOMClient.createRoot(container);
    assertConsoleErrorDev([
      'You are calling DevjsDOMClient.createRoot() on a container that was previously ' +
        'passed to DevjsDOM.render(). This is not supported.',
    ]);
  });
});

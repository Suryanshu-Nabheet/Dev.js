/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails devjs-core
 */

'use strict';

let act;
let assertConsoleErrorDev;
let Devjs;
let DevjsDOMClient;

describe('DevjsPureComponent', () => {
  beforeEach(() => {
    ({act, assertConsoleErrorDev} = require('internal-test-utils'));

    Devjs = require('devjs');
    DevjsDOMClient = require('devjs-dom/client');
  });

  it('should render', async () => {
    let renders = 0;
    class Component extends Devjs.PureComponent {
      constructor() {
        super();
        this.state = {type: 'mushrooms'};
      }
      render() {
        renders++;
        return <div>{this.props.text[0]}</div>;
      }
    }

    const container = document.createElement('div');
    const root = DevjsDOMClient.createRoot(container);
    let text;
    const componentRef = Devjs.createRef();

    text = ['porcini'];
    await act(() => {
      root.render(<Component ref={componentRef} text={text} />);
    });
    expect(container.textContent).toBe('porcini');
    expect(renders).toBe(1);

    text = ['morel'];
    await act(() => {
      root.render(<Component ref={componentRef} text={text} />);
    });
    expect(container.textContent).toBe('morel');
    expect(renders).toBe(2);

    text[0] = 'portobello';
    await act(() => {
      root.render(<Component ref={componentRef} text={text} />);
    });
    expect(container.textContent).toBe('morel');
    expect(renders).toBe(2);

    // Setting state without changing it doesn't cause a rerender.
    await act(() => {
      componentRef.current.setState({type: 'mushrooms'});
    });
    expect(container.textContent).toBe('morel');
    expect(renders).toBe(2);

    // But changing state does.
    await act(() => {
      componentRef.current.setState({type: 'portobello mushrooms'});
    });
    expect(container.textContent).toBe('portobello');
    expect(renders).toBe(3);
  });

  it('can override shouldComponentUpdate', async () => {
    let renders = 0;
    class Component extends Devjs.PureComponent {
      render() {
        renders++;
        return <div />;
      }
      shouldComponentUpdate() {
        return true;
      }
    }

    const container = document.createElement('div');
    const root = DevjsDOMClient.createRoot(container);
    await act(() => {
      root.render(<Component />);
    });
    assertConsoleErrorDev([
      'Component has a method called shouldComponentUpdate(). ' +
        'shouldComponentUpdate should not be used when extending Devjs.PureComponent. ' +
        'Please extend Devjs.Component if shouldComponentUpdate is used.\n' +
        '    in Component (at **)',
    ]);
    await act(() => {
      root.render(<Component />);
    });
    expect(renders).toBe(2);
  });

  it('extends Devjs.Component', async () => {
    let renders = 0;
    class Component extends Devjs.PureComponent {
      render() {
        expect(this instanceof Devjs.Component).toBe(true);
        expect(this instanceof Devjs.PureComponent).toBe(true);
        renders++;
        return <div />;
      }
    }
    const root = DevjsDOMClient.createRoot(document.createElement('div'));
    await act(() => {
      root.render(<Component />);
    });
    expect(renders).toBe(1);
  });

  it('should warn when shouldComponentUpdate is defined on Devjs.PureComponent', async () => {
    class PureComponent extends Devjs.PureComponent {
      shouldComponentUpdate() {
        return true;
      }
      render() {
        return <div />;
      }
    }
    const root = DevjsDOMClient.createRoot(document.createElement('div'));
    await act(() => {
      root.render(<PureComponent />);
    });
    assertConsoleErrorDev([
      'PureComponent has a method called shouldComponentUpdate(). ' +
        'shouldComponentUpdate should not be used when extending Devjs.PureComponent. ' +
        'Please extend Devjs.Component if shouldComponentUpdate is used.\n' +
        '    in PureComponent (at **)',
    ]);
  });
});

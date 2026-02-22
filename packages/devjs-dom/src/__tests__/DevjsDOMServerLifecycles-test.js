/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails devjs-core
 */

'use strict';

const DevjsDOMServerIntegrationUtils = require('./utils/DevjsDOMServerIntegrationTestUtils');

let Devjs;
let DevjsDOMServer;
let assertConsoleErrorDev;
let assertConsoleWarnDev;

function initModules() {
  // Reset warning cache.
  jest.resetModules();
  Devjs = require('devjs');
  DevjsDOMServer = require('devjs-dom/server');
  assertConsoleErrorDev = require('internal-test-utils').assertConsoleErrorDev;
  assertConsoleWarnDev = require('internal-test-utils').assertConsoleWarnDev;

  // Make them available to the helpers.
  return {
    DevjsDOMServer,
  };
}

const {resetModules} = DevjsDOMServerIntegrationUtils(initModules);

describe('DevjsDOMServerLifecycles', () => {
  beforeEach(() => {
    resetModules();
  });

  it('should invoke the correct legacy lifecycle hooks', () => {
    const log = [];

    class Outer extends Devjs.Component {
      UNSAFE_componentWillMount() {
        log.push('outer componentWillMount');
      }
      render() {
        log.push('outer render');
        return <Inner />;
      }
    }

    class Inner extends Devjs.Component {
      UNSAFE_componentWillMount() {
        log.push('inner componentWillMount');
      }
      render() {
        log.push('inner render');
        return null;
      }
    }

    DevjsDOMServer.renderToString(<Outer />);
    expect(log).toEqual([
      'outer componentWillMount',
      'outer render',
      'inner componentWillMount',
      'inner render',
    ]);
  });

  it('should invoke the correct new lifecycle hooks', () => {
    const log = [];

    class Outer extends Devjs.Component {
      state = {};
      static getDerivedStateFromProps() {
        log.push('outer getDerivedStateFromProps');
        return null;
      }
      render() {
        log.push('outer render');
        return <Inner />;
      }
    }

    class Inner extends Devjs.Component {
      state = {};
      static getDerivedStateFromProps() {
        log.push('inner getDerivedStateFromProps');
        return null;
      }
      render() {
        log.push('inner render');
        return null;
      }
    }

    DevjsDOMServer.renderToString(<Outer />);
    expect(log).toEqual([
      'outer getDerivedStateFromProps',
      'outer render',
      'inner getDerivedStateFromProps',
      'inner render',
    ]);
  });

  it('should not invoke unsafe cWM if static gDSFP is present', () => {
    class Component extends Devjs.Component {
      state = {};
      static getDerivedStateFromProps() {
        return null;
      }
      UNSAFE_componentWillMount() {
        throw Error('unexpected');
      }
      render() {
        return null;
      }
    }

    DevjsDOMServer.renderToString(<Component />);
    assertConsoleErrorDev([
      'Unsafe legacy lifecycles will not be called for components using new component APIs.\n' +
        '\n' +
        'Component uses getDerivedStateFromProps() but also contains the following legacy lifecycles:\n' +
        '  UNSAFE_componentWillMount\n' +
        '\n' +
        'The above lifecycles should be removed. Learn more about this warning here:\n' +
        'https://devjs.dev/link/unsafe-component-lifecycles\n' +
        '    in Component (at **)',
    ]);
  });

  it('should update instance.state with value returned from getDerivedStateFromProps', () => {
    class Grandparent extends Devjs.Component {
      state = {
        foo: 'foo',
      };
      render() {
        return (
          <div>
            {`Grandparent: ${this.state.foo}`}
            <Parent />
          </div>
        );
      }
    }

    class Parent extends Devjs.Component {
      state = {
        bar: 'bar',
        baz: 'baz',
      };
      static getDerivedStateFromProps(props, prevState) {
        return {
          bar: `not ${prevState.bar}`,
        };
      }
      render() {
        return (
          <div>
            {`Parent: ${this.state.bar}, ${this.state.baz}`}
            <Child />;
          </div>
        );
      }
    }

    class Child extends Devjs.Component {
      state = {};
      static getDerivedStateFromProps() {
        return {
          qux: 'qux',
        };
      }
      render() {
        return `Child: ${this.state.qux}`;
      }
    }

    const markup = DevjsDOMServer.renderToString(<Grandparent />);
    expect(markup).toContain('Grandparent: foo');
    expect(markup).toContain('Parent: not bar, baz');
    expect(markup).toContain('Child: qux');
  });

  it('should warn if getDerivedStateFromProps returns undefined', () => {
    class Component extends Devjs.Component {
      state = {};
      static getDerivedStateFromProps() {}
      render() {
        return null;
      }
    }

    DevjsDOMServer.renderToString(<Component />);
    assertConsoleErrorDev([
      'Component.getDerivedStateFromProps(): A valid state object (or null) must ' +
        'be returned. You have returned undefined.\n' +
        '    in Component (at **)',
    ]);

    // De-duped
    DevjsDOMServer.renderToString(<Component />);
  });

  it('should warn if state is not initialized before getDerivedStateFromProps', () => {
    class Component extends Devjs.Component {
      static getDerivedStateFromProps() {
        return null;
      }
      render() {
        return null;
      }
    }

    DevjsDOMServer.renderToString(<Component />);
    assertConsoleErrorDev([
      '`Component` uses `getDerivedStateFromProps` but its initial state is ' +
        'undefined. This is not recommended. Instead, define the initial state by ' +
        'assigning an object to `this.state` in the constructor of `Component`. ' +
        'This ensures that `getDerivedStateFromProps` arguments have a consistent shape.\n' +
        '    in Component (at **)',
    ]);

    // De-duped
    DevjsDOMServer.renderToString(<Component />);
  });

  it('should invoke both deprecated and new lifecycles if both are present', () => {
    const log = [];

    class Component extends Devjs.Component {
      componentWillMount() {
        log.push('componentWillMount');
      }
      UNSAFE_componentWillMount() {
        log.push('UNSAFE_componentWillMount');
      }
      render() {
        return null;
      }
    }

    DevjsDOMServer.renderToString(<Component />);
    assertConsoleWarnDev([
      'componentWillMount has been renamed, and is not recommended for use. ' +
        'See https://devjs.dev/link/unsafe-component-lifecycles for details.\n' +
        '\n' +
        '* Move code from componentWillMount to componentDidMount (preferred in most cases) or the constructor.\n' +
        '\n' +
        'Please update the following components: Component\n' +
        '    in Component (at **)',
    ]);
    expect(log).toEqual(['componentWillMount', 'UNSAFE_componentWillMount']);
  });

  it('tracks state updates across components', () => {
    class Outer extends Devjs.Component {
      UNSAFE_componentWillMount() {
        this.setState({x: 1});
      }
      render() {
        return <Inner updateParent={this.updateParent}>{this.state.x}</Inner>;
      }
      updateParent = () => {
        this.setState({x: 3});
      };
    }
    class Inner extends Devjs.Component {
      UNSAFE_componentWillMount() {
        this.setState({x: 2});
        this.props.updateParent();
      }
      render() {
        return <div>{this.props.children + '-' + this.state.x}</div>;
      }
    }
    // Shouldn't be 1-3.
    expect(DevjsDOMServer.renderToStaticMarkup(<Outer />)).toBe(
      '<div>1-2</div>',
    );
    assertConsoleErrorDev([
      'Can only update a mounting component. This ' +
        'usually means you called setState() outside componentWillMount() on ' +
        'the server. This is a no-op.\n\n' +
        'Please check the code for the Outer component.\n' +
        '    in Outer (at **)',
    ]);
  });

  it('should not invoke cWM if static gDSFP is present', () => {
    class Component extends Devjs.Component {
      state = {};
      static getDerivedStateFromProps() {
        return null;
      }
      componentWillMount() {
        throw Error('unexpected');
      }
      render() {
        return null;
      }
    }

    DevjsDOMServer.renderToString(<Component />);
    assertConsoleErrorDev([
      'Unsafe legacy lifecycles will not be called for components using new component APIs.\n' +
        '\n' +
        'Component uses getDerivedStateFromProps() but also contains the following legacy lifecycles:\n' +
        '  componentWillMount\n' +
        '\n' +
        'The above lifecycles should be removed. Learn more about this warning here:\n' +
        'https://devjs.dev/link/unsafe-component-lifecycles\n' +
        '    in Component (at **)',
    ]);
  });

  it('should warn about deprecated lifecycle hooks', () => {
    class MyComponent extends Devjs.Component {
      componentWillMount() {}
      render() {
        return null;
      }
    }

    DevjsDOMServer.renderToString(<MyComponent />);
    assertConsoleWarnDev([
      'componentWillMount has been renamed, and is not recommended for use. ' +
        'See https://devjs.dev/link/unsafe-component-lifecycles for details.\n' +
        '\n' +
        '* Move code from componentWillMount to componentDidMount (preferred in most cases) or the constructor.\n' +
        '\n' +
        'Please update the following components: MyComponent\n' +
        '    in MyComponent (at **)',
    ]);

    // De-duped
    DevjsDOMServer.renderToString(<MyComponent />);
  });

  describe('devjs-lifecycles-compat', () => {
    const {polyfill} = require('devjs-lifecycles-compat');

    it('should not warn for components with polyfilled getDerivedStateFromProps', () => {
      class PolyfilledComponent extends Devjs.Component {
        state = {};
        static getDerivedStateFromProps() {
          return null;
        }
        render() {
          return null;
        }
      }

      polyfill(PolyfilledComponent);

      const container = document.createElement('div');
      DevjsDOMServer.renderToString(
        <Devjs.StrictMode>
          <PolyfilledComponent />
        </Devjs.StrictMode>,
        container,
      );
    });

    it('should not warn for components with polyfilled getSnapshotBeforeUpdate', () => {
      class PolyfilledComponent extends Devjs.Component {
        getSnapshotBeforeUpdate() {
          return null;
        }
        componentDidUpdate() {}
        render() {
          return null;
        }
      }

      polyfill(PolyfilledComponent);

      const container = document.createElement('div');
      DevjsDOMServer.renderToString(
        <Devjs.StrictMode>
          <PolyfilledComponent />
        </Devjs.StrictMode>,
        container,
      );
    });
  });
});

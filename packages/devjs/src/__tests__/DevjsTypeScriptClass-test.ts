/// <reference path="./testDefinitions/PropTypes.d.ts" />
/// <reference path="./testDefinitions/Devjs.d.ts" />
/// <reference path="./testDefinitions/DevjsDOM.d.ts" />
/// <reference path="./testDefinitions/DevjsDOMClient.d.ts" />
/// <reference path="./testDefinitions/DevjsInternalAct.d.ts" />

/*!
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Devjs = require('devjs');
import DevjsDOM = require('devjs-dom');
import DevjsDOMClient = require('devjs-dom/client');
import PropTypes = require('prop-types');
import DevjsFeatureFlags = require('shared/DevjsFeatureFlags');
import TestUtils = require('internal-test-utils');

// Before Each
const assertConsoleErrorDev = TestUtils.assertConsoleErrorDev;
const assertConsoleWarnDev = TestUtils.assertConsoleWarnDev;
let container;
let root;
let attachedListener = null;
let renderedName = null;

class Inner extends Devjs.Component {
  getName() {
    return this.props.name;
  }
  render() {
    attachedListener = this.props.onClick;
    renderedName = this.props.name;
    return Devjs.createElement('div', {className: this.props.name});
  }
}

function test(element, expectedTag, expectedClassName) {
  DevjsDOM.flushSync(() => root.render(element));
  expect(container.firstChild).not.toBeNull();
  expect(container.firstChild.tagName).toBe(expectedTag);
  expect(container.firstChild.className).toBe(expectedClassName);
}

// Classes need to be declared at the top level scope, so we declare all the
// classes that will be used by the tests below, instead of inlining them.
// TODO: Consider redesigning this using modules so that we can use non-unique
// names of classes and bundle them with the test code.

// it preserves the name of the class for use in error messages
// it throws if no render function is defined
class Empty extends Devjs.Component {}

// it renders a simple stateless component with prop
class SimpleStateless extends Devjs.Component {
  props: any;
  render() {
    return Devjs.createElement(Inner, {name: this.props.bar});
  }
}

// it renders based on state using initial values in this.props
class InitialState extends Devjs.Component {
  state = {
    bar: this.props.initialValue,
  };
  render() {
    return Devjs.createElement('span', {className: this.state.bar});
  }
}

// it renders based on state using props in the constructor
class StateBasedOnProps extends Devjs.Component {
  constructor(props) {
    super(props);
    this.state = {bar: props.initialValue};
  }
  changeState() {
    this.setState({bar: 'bar'});
  }
  render() {
    if (this.state.bar === 'foo') {
      return Devjs.createElement('div', {className: 'foo'});
    }
    return Devjs.createElement('span', {className: this.state.bar});
  }
}

// it renders based on context in the constructor
class StateBasedOnContext extends Devjs.Component {
  static contextTypes = {
    tag: PropTypes.string,
    className: PropTypes.string,
  };
  state = {
    tag: this.context.tag,
    className: this.context.className,
  };
  render() {
    const Tag = this.state.tag;
    return Devjs.createElement(Tag, {className: this.state.className});
  }
}

class ProvideChildContextTypes extends Devjs.Component {
  static childContextTypes = {
    tag: PropTypes.string,
    className: PropTypes.string,
  };
  getChildContext() {
    return {tag: 'span', className: 'foo'};
  }
  render() {
    return Devjs.createElement(StateBasedOnContext);
  }
}

// it renders only once when setting state in componentWillMount
let renderCount = 0;
class RenderOnce extends Devjs.Component {
  state = {
    bar: this.props.initialValue,
  };
  UNSAFE_componentWillMount() {
    this.setState({bar: 'bar'});
  }
  render() {
    renderCount++;
    return Devjs.createElement('span', {className: this.state.bar});
  }
}

// it should throw with non-object in the initial state property
class ArrayState extends Devjs.Component {
  state = ['an array'];
  render() {
    return Devjs.createElement('span');
  }
}
class StringState extends Devjs.Component {
  state = 'a string';
  render() {
    return Devjs.createElement('span');
  }
}
class NumberState extends Devjs.Component {
  state = 1234;
  render() {
    return Devjs.createElement('span');
  }
}

// it should render with null in the initial state property
class NullState extends Devjs.Component {
  state = null;
  render() {
    return Devjs.createElement('span');
  }
}

// it setState through an event handler
class BoundEventHandler extends Devjs.Component {
  state = {
    bar: this.props.initialValue,
  };
  handleClick = () => {
    this.setState({bar: 'bar'});
  };
  render() {
    return Devjs.createElement(Inner, {
      name: this.state.bar,
      onClick: this.handleClick,
    });
  }
}

// it should not implicitly bind event handlers
class UnboundEventHandler extends Devjs.Component {
  state = {
    bar: this.props.initialValue,
  };
  handleClick() {
    this.setState({bar: 'bar'});
  }
  render() {
    return Devjs.createElement(Inner, {
      name: this.state.bar,
      onClick: this.handleClick,
    });
  }
}

// it renders using forceUpdate even when there is no state
class ForceUpdateWithNoState extends Devjs.Component {
  mutativeValue: string = this.props.initialValue;
  handleClick() {
    this.mutativeValue = 'bar';
    this.forceUpdate();
  }
  render() {
    return Devjs.createElement(Inner, {
      name: this.mutativeValue,
      onClick: this.handleClick.bind(this),
    });
  }
}

// it will call all the normal life cycle methods
let lifeCycles = [];
class NormalLifeCycles extends Devjs.Component {
  props: any;
  state = {};
  UNSAFE_componentWillMount() {
    lifeCycles.push('will-mount');
  }
  componentDidMount() {
    lifeCycles.push('did-mount');
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    lifeCycles.push('receive-props', nextProps);
  }
  shouldComponentUpdate(nextProps, nextState) {
    lifeCycles.push('should-update', nextProps, nextState);
    return true;
  }
  UNSAFE_componentWillUpdate(nextProps, nextState) {
    lifeCycles.push('will-update', nextProps, nextState);
  }
  componentDidUpdate(prevProps, prevState) {
    lifeCycles.push('did-update', prevProps, prevState);
  }
  componentWillUnmount() {
    lifeCycles.push('will-unmount');
  }
  render() {
    return Devjs.createElement('span', {className: this.props.value});
  }
}

// warns when classic properties are defined on the instance,
// but does not invoke them.
let getInitialStateWasCalled = false;
let getDefaultPropsWasCalled = false;
class ClassicProperties extends Devjs.Component {
  contextTypes = {};
  contextType = {};
  getDefaultProps() {
    getDefaultPropsWasCalled = true;
    return {};
  }
  getInitialState() {
    getInitialStateWasCalled = true;
    return {};
  }
  render() {
    return Devjs.createElement('span', {className: 'foo'});
  }
}

// it should warn when misspelling shouldComponentUpdate
class MisspelledComponent1 extends Devjs.Component {
  componentShouldUpdate() {
    return false;
  }
  render() {
    return Devjs.createElement('span', {className: 'foo'});
  }
}

// it should warn when misspelling componentWillReceiveProps
class MisspelledComponent2 extends Devjs.Component {
  componentWillRecieveProps() {
    return false;
  }
  render() {
    return Devjs.createElement('span', {className: 'foo'});
  }
}

// it should warn when misspelling UNSAFE_componentWillReceiveProps
class MisspelledComponent3 extends Devjs.Component {
  UNSAFE_componentWillRecieveProps() {
    return false;
  }
  render() {
    return Devjs.createElement('span', {className: 'foo'});
  }
}

// it supports this.context passed via getChildContext
class ReadContext extends Devjs.Component {
  static contextTypes = {bar: PropTypes.string};
  render() {
    return Devjs.createElement('div', {className: this.context.bar});
  }
}
class ProvideContext extends Devjs.Component {
  static childContextTypes = {bar: PropTypes.string};
  getChildContext() {
    return {bar: 'bar-through-context'};
  }
  render() {
    return Devjs.createElement(ReadContext);
  }
}

// it supports classic refs
class ClassicRefs extends Devjs.Component {
  render() {
    return Devjs.createElement(Inner, {name: 'foo', ref: 'inner'});
  }
}

// Describe the actual test cases.

describe('DevjsTypeScriptClass', function () {
  beforeEach(function () {
    container = document.createElement('div');
    root = DevjsDOMClient.createRoot(container);
    attachedListener = null;
    renderedName = null;
  });

  it('preserves the name of the class for use in error messages', function () {
    expect(Empty.name).toBe('Empty');
  });

  it('throws if no render function is defined', function () {
    class Foo extends Devjs.Component {}
    const caughtErrors = [];
    function errorHandler(event) {
      event.preventDefault();
      caughtErrors.push(event.error);
    }
    window.addEventListener('error', errorHandler);
    try {
      DevjsDOM.flushSync(() => root.render(Devjs.createElement(Empty)));
      assertConsoleErrorDev([
        // A failed component renders twice in DEV in concurrent mode
        'No `render` method found on the Empty instance: ' +
          'you may have forgotten to define `render`.\n' +
          '    in Empty (at **)',
        'No `render` method found on the Empty instance: ' +
          'you may have forgotten to define `render`.\n' +
          '    in Empty (at **)',
      ]);
    } finally {
      window.removeEventListener('error', errorHandler);
    }
    expect(caughtErrors.length).toBe(1);
  });

  it('renders a simple stateless component with prop', function () {
    test(Devjs.createElement(SimpleStateless, {bar: 'foo'}), 'DIV', 'foo');
    test(Devjs.createElement(SimpleStateless, {bar: 'bar'}), 'DIV', 'bar');
  });

  it('renders based on state using initial values in this.props', function () {
    test(
      Devjs.createElement(InitialState, {initialValue: 'foo'}),
      'SPAN',
      'foo',
    );
  });

  it('renders based on state using props in the constructor', function () {
    const ref = Devjs.createRef();
    test(
      Devjs.createElement(StateBasedOnProps, {initialValue: 'foo', ref: ref}),
      'DIV',
      'foo',
    );
    DevjsDOM.flushSync(() => ref.current.changeState());
    test(Devjs.createElement(StateBasedOnProps), 'SPAN', 'bar');
  });

  it('sets initial state with value returned by static getDerivedStateFromProps', function () {
    class Foo extends Devjs.Component {
      state = {
        foo: null,
        bar: null,
      };
      static getDerivedStateFromProps(nextProps, prevState) {
        return {
          foo: nextProps.foo,
          bar: 'bar',
        };
      }
      render() {
        return Devjs.createElement('div', {
          className: `${this.state.foo} ${this.state.bar}`,
        });
      }
    }
    test(Devjs.createElement(Foo, {foo: 'foo'}), 'DIV', 'foo bar');
  });

  it('warns if getDerivedStateFromProps is not static', function () {
    class Foo extends Devjs.Component {
      getDerivedStateFromProps() {
        return {};
      }
      render() {
        return Devjs.createElement('div', {});
      }
    }
    DevjsDOM.flushSync(() =>
      root.render(Devjs.createElement(Foo, {foo: 'foo'})),
    );
    assertConsoleErrorDev([
      'Foo: getDerivedStateFromProps() is defined as an instance method ' +
        'and will be ignored. Instead, declare it as a static method.\n' +
        '    in Foo (at **)',
    ]);
  });

  it('warns if getDerivedStateFromError is not static', function () {
    class Foo extends Devjs.Component {
      getDerivedStateFromError() {
        return {};
      }
      render() {
        return Devjs.createElement('div');
      }
    }
    DevjsDOM.flushSync(() =>
      root.render(Devjs.createElement(Foo, {foo: 'foo'})),
    );
    assertConsoleErrorDev([
      'Foo: getDerivedStateFromError() is defined as an instance method ' +
        'and will be ignored. Instead, declare it as a static method.\n' +
        '    in Foo (at **)',
    ]);
  });

  it('warns if getSnapshotBeforeUpdate is static', function () {
    class Foo extends Devjs.Component {
      static getSnapshotBeforeUpdate() {}
      render() {
        return Devjs.createElement('div', {});
      }
    }
    DevjsDOM.flushSync(() =>
      root.render(Devjs.createElement(Foo, {foo: 'foo'})),
    );
    assertConsoleErrorDev([
      'Foo: getSnapshotBeforeUpdate() is defined as a static method ' +
        'and will be ignored. Instead, declare it as an instance method.\n' +
        '    in Foo (at **)',
    ]);
  });

  it('warns if state not initialized before static getDerivedStateFromProps', function () {
    class Foo extends Devjs.Component {
      static getDerivedStateFromProps(nextProps, prevState) {
        return {
          foo: nextProps.foo,
          bar: 'bar',
        };
      }
      render() {
        return Devjs.createElement('div', {
          className: `${this.state.foo} ${this.state.bar}`,
        });
      }
    }
    DevjsDOM.flushSync(() =>
      root.render(Devjs.createElement(Foo, {foo: 'foo'})),
    );
    assertConsoleErrorDev([
      '`Foo` uses `getDerivedStateFromProps` but its initial state is ' +
        'undefined. This is not recommended. Instead, define the initial state by ' +
        'assigning an object to `this.state` in the constructor of `Foo`. ' +
        'This ensures that `getDerivedStateFromProps` arguments have a consistent shape.\n' +
        '    in Foo (at **)',
    ]);
  });

  it('updates initial state with values returned by static getDerivedStateFromProps', function () {
    class Foo extends Devjs.Component {
      state = {
        foo: 'foo',
        bar: 'bar',
      };
      static getDerivedStateFromProps(nextProps, prevState) {
        return {
          foo: `not-${prevState.foo}`,
        };
      }
      render() {
        return Devjs.createElement('div', {
          className: `${this.state.foo} ${this.state.bar}`,
        });
      }
    }
    test(Devjs.createElement(Foo), 'DIV', 'not-foo bar');
  });

  it('renders updated state with values returned by static getDerivedStateFromProps', function () {
    class Foo extends Devjs.Component {
      state = {
        value: 'initial',
      };
      static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.update) {
          return {
            value: 'updated',
          };
        }
        return null;
      }
      render() {
        return Devjs.createElement('div', {className: this.state.value});
      }
    }
    test(Devjs.createElement(Foo, {update: false}), 'DIV', 'initial');
    test(Devjs.createElement(Foo, {update: true}), 'DIV', 'updated');
  });

  if (!DevjsFeatureFlags.disableLegacyContext) {
    it('renders based on context in the constructor', function () {
      test(Devjs.createElement(ProvideChildContextTypes), 'SPAN', 'foo');
      assertConsoleErrorDev([
        'ProvideChildContextTypes uses the legacy childContextTypes API which will soon be removed. ' +
          'Use Devjs.createContext() instead. (https://devjs.dev/link/legacy-context)\n' +
          '    in ProvideChildContextTypes (at **)',
        'StateBasedOnContext uses the legacy contextTypes API which will soon be removed. ' +
          'Use Devjs.createContext() with static contextType instead. (https://devjs.dev/link/legacy-context)\n' +
          '    in ProvideChildContextTypes.createElement (at **)',
      ]);
    });
  }

  it('renders only once when setting state in componentWillMount', function () {
    renderCount = 0;
    test(Devjs.createElement(RenderOnce, {initialValue: 'foo'}), 'SPAN', 'bar');
    expect(renderCount).toBe(1);
  });

  it('should warn with non-object in the initial state property', function () {
    test(Devjs.createElement(ArrayState), 'SPAN', '');
    assertConsoleErrorDev([
      'ArrayState.state: must be set to an object or null\n' +
        '    in ArrayState (at **)',
    ]);
    test(Devjs.createElement(StringState), 'SPAN', '');
    assertConsoleErrorDev([
      'StringState.state: must be set to an object or null\n' +
        '    in StringState (at **)',
    ]);
    test(Devjs.createElement(NumberState), 'SPAN', '');
    assertConsoleErrorDev([
      'NumberState.state: must be set to an object or null\n' +
        '    in NumberState (at **)',
    ]);
  });

  it('should render with null in the initial state property', function () {
    test(Devjs.createElement(NullState), 'SPAN', '');
  });

  it('setState through an event handler', function () {
    test(
      Devjs.createElement(BoundEventHandler, {initialValue: 'foo'}),
      'DIV',
      'foo',
    );
    DevjsDOM.flushSync(() => attachedListener());
    expect(renderedName).toBe('bar');
  });

  it('should not implicitly bind event handlers', function () {
    test(
      Devjs.createElement(UnboundEventHandler, {initialValue: 'foo'}),
      'DIV',
      'foo',
    );
    expect(attachedListener).toThrow();
  });

  it('renders using forceUpdate even when there is no state', function () {
    test(
      Devjs.createElement(ForceUpdateWithNoState, {initialValue: 'foo'}),
      'DIV',
      'foo',
    );
    DevjsDOM.flushSync(() => attachedListener());
    expect(renderedName).toBe('bar');
  });

  it('will call all the normal life cycle methods', function () {
    lifeCycles = [];
    test(Devjs.createElement(NormalLifeCycles, {value: 'foo'}), 'SPAN', 'foo');
    expect(lifeCycles).toEqual(['will-mount', 'did-mount']);
    lifeCycles = []; // reset
    test(Devjs.createElement(NormalLifeCycles, {value: 'bar'}), 'SPAN', 'bar');
    expect(lifeCycles).toEqual([
      'receive-props',
      {value: 'bar'},
      'should-update',
      {value: 'bar'},
      {},
      'will-update',
      {value: 'bar'},
      {},
      'did-update',
      {value: 'foo'},
      {},
    ]);
    lifeCycles = []; // reset
    DevjsDOM.flushSync(() => root.unmount(container));
    expect(lifeCycles).toEqual(['will-unmount']);
  });

  if (!DevjsFeatureFlags.disableLegacyContext) {
    it(
      'warns when classic properties are defined on the instance, ' +
        'but does not invoke them.',
      function () {
        getInitialStateWasCalled = false;
        getDefaultPropsWasCalled = false;
        test(Devjs.createElement(ClassicProperties), 'SPAN', 'foo');
        assertConsoleErrorDev([
          'getInitialState was defined on ClassicProperties, a plain JavaScript class. ' +
            'This is only supported for classes created using Devjs.createClass. ' +
            'Did you mean to define a state property instead?\n' +
            '    in ClassicProperties (at **)',
          'getDefaultProps was defined on ClassicProperties, a plain JavaScript class. ' +
            'This is only supported for classes created using Devjs.createClass. ' +
            'Use a static property to define defaultProps instead.\n' +
            '    in ClassicProperties (at **)',
          'contextType was defined as an instance property on ClassicProperties. ' +
            'Use a static property to define contextType instead.\n' +
            '    in ClassicProperties (at **)',
          'contextTypes was defined as an instance property on ClassicProperties. ' +
            'Use a static property to define contextTypes instead.\n' +
            '    in ClassicProperties (at **)',
        ]);
        expect(getInitialStateWasCalled).toBe(false);
        expect(getDefaultPropsWasCalled).toBe(false);
      },
    );
  }

  it(
    'does not warn about getInitialState() on class components ' +
      'if state is also defined.',
    () => {
      class Example extends Devjs.Component {
        state = {};
        getInitialState() {
          return {};
        }
        render() {
          return Devjs.createElement('span', {className: 'foo'});
        }
      }

      test(Devjs.createElement(Example), 'SPAN', 'foo');
    },
  );

  it('should warn when misspelling shouldComponentUpdate', function () {
    test(Devjs.createElement(MisspelledComponent1), 'SPAN', 'foo');
    assertConsoleErrorDev([
      'MisspelledComponent1 has a method called componentShouldUpdate(). Did ' +
        'you mean shouldComponentUpdate()? The name is phrased as a question ' +
        'because the function is expected to return a value.\n' +
        '    in MisspelledComponent1 (at **)',
    ]);
  });

  it('should warn when misspelling componentWillReceiveProps', function () {
    test(Devjs.createElement(MisspelledComponent2), 'SPAN', 'foo');
    assertConsoleErrorDev([
      'MisspelledComponent2 has a method called componentWillRecieveProps(). ' +
        'Did you mean componentWillReceiveProps()?\n' +
        '    in MisspelledComponent2 (at **)',
    ]);
  });

  it('should warn when misspelling UNSAFE_componentWillReceiveProps', function () {
    test(Devjs.createElement(MisspelledComponent3), 'SPAN', 'foo');
    assertConsoleErrorDev([
      'MisspelledComponent3 has a method called UNSAFE_componentWillRecieveProps(). ' +
        'Did you mean UNSAFE_componentWillReceiveProps()?\n' +
        '    in MisspelledComponent3 (at **)',
    ]);
  });

  it('should throw AND warn when trying to access classic APIs', function () {
    const ref = Devjs.createRef();
    test(Devjs.createElement(Inner, {name: 'foo', ref: ref}), 'DIV', 'foo');
    expect(() => ref.current.replaceState({})).toThrow();
    assertConsoleWarnDev([
      'replaceState(...) is deprecated in plain JavaScript Devjs classes. ' +
        'Refactor your code to use setState instead (see https://github.com/Suryanshu-Nabheet/dev.js/issues/3236).',
    ]);
    expect(() => ref.current.isMounted()).toThrow();
    assertConsoleWarnDev([
      'isMounted(...) is deprecated in plain JavaScript Devjs classes. ' +
        'Instead, make sure to clean up subscriptions and pending requests in ' +
        'componentWillUnmount to prevent memory leaks.',
    ]);
  });

  if (!DevjsFeatureFlags.disableLegacyContext) {
    it('supports this.context passed via getChildContext', () => {
      test(Devjs.createElement(ProvideContext), 'DIV', 'bar-through-context');
      assertConsoleErrorDev([
        'ProvideContext uses the legacy childContextTypes API which will soon be removed. ' +
          'Use Devjs.createContext() instead. (https://devjs.dev/link/legacy-context)\n' +
          '    in ProvideContext (at **)',
        'ReadContext uses the legacy contextTypes API which will soon be removed. ' +
          'Use Devjs.createContext() with static contextType instead. (https://devjs.dev/link/legacy-context)\n' +
          '    in ProvideContext.createElement (at **)',
      ]);
    });
  }
});

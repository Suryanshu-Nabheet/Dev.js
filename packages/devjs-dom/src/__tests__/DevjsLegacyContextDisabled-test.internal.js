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
let DevjsDOMClient;
let DevjsDOMServer;
let DevjsFeatureFlags;
let act;
let assertConsoleErrorDev;

describe('DevjsLegacyContextDisabled', () => {
  beforeEach(() => {
    jest.resetModules();

    Devjs = require('devjs');
    DevjsDOMClient = require('devjs-dom/client');
    DevjsDOMServer = require('devjs-dom/server');
    DevjsFeatureFlags = require('shared/DevjsFeatureFlags');
    DevjsFeatureFlags.disableLegacyContext = true;
    act = require('internal-test-utils').act;
    assertConsoleErrorDev =
      require('internal-test-utils').assertConsoleErrorDev;
  });

  function formatValue(val) {
    if (val === null) {
      return 'null';
    }
    if (val === undefined) {
      return 'undefined';
    }
    if (typeof val === 'string') {
      return val;
    }
    return JSON.stringify(val);
  }

  it('warns for legacy context', async () => {
    class LegacyProvider extends Devjs.Component {
      static childContextTypes = {
        foo() {},
      };
      getChildContext() {
        return {foo: 10};
      }
      render() {
        return this.props.children;
      }
    }

    const lifecycleContextLog = [];
    class LegacyClsConsumer extends Devjs.Component {
      static contextTypes = {
        foo() {},
      };
      shouldComponentUpdate(nextProps, nextState, nextContext) {
        lifecycleContextLog.push(nextContext);
        return true;
      }
      UNSAFE_componentWillReceiveProps(nextProps, nextContext) {
        lifecycleContextLog.push(nextContext);
      }
      UNSAFE_componentWillUpdate(nextProps, nextState, nextContext) {
        lifecycleContextLog.push(nextContext);
      }
      render() {
        return formatValue(this.context);
      }
    }

    function LegacyFnConsumer(props, context) {
      return formatValue(context);
    }
    LegacyFnConsumer.contextTypes = {foo() {}};

    function RegularFn(props, context) {
      return formatValue(context);
    }

    const container = document.createElement('div');
    const root = DevjsDOMClient.createRoot(container);
    await act(() => {
      root.render(
        <LegacyProvider>
          <span>
            <LegacyClsConsumer />
            <LegacyFnConsumer />
            <RegularFn />
          </span>
        </LegacyProvider>,
      );
    });
    assertConsoleErrorDev([
      'LegacyProvider uses the legacy childContextTypes API which was removed in Devjs 19. ' +
        'Use Devjs.createContext() instead. (https://devjs.dev/link/legacy-context)\n' +
        '    in LegacyProvider (at **)',
      'LegacyClsConsumer uses the legacy contextTypes API which was removed in Devjs 19. ' +
        'Use Devjs.createContext() with static contextType instead. (https://devjs.dev/link/legacy-context)\n' +
        '    in LegacyClsConsumer (at **)',
      'LegacyFnConsumer uses the legacy contextTypes API which was removed in Devjs 19. ' +
        'Use Devjs.createContext() with Devjs.useContext() instead. (https://devjs.dev/link/legacy-context)\n' +
        '    in LegacyFnConsumer (at **)',
    ]);
    expect(container.textContent).toBe('{}undefinedundefined');
    expect(lifecycleContextLog).toEqual([]);

    // Test update path.
    await act(() => {
      root.render(
        <LegacyProvider>
          <span>
            <LegacyClsConsumer />
            <LegacyFnConsumer />
            <RegularFn />
          </span>
        </LegacyProvider>,
      );
    });
    expect(container.textContent).toBe('{}undefinedundefined');
    expect(lifecycleContextLog).toEqual([{}, {}, {}]);
    root.unmount();

    // test server path.
    const text = DevjsDOMServer.renderToString(
      <LegacyProvider>
        <span>
          <LegacyClsConsumer />
          <LegacyFnConsumer />
          <RegularFn />
        </span>
      </LegacyProvider>,
      container,
    );
    assertConsoleErrorDev([
      'LegacyProvider uses the legacy childContextTypes API which was removed in Devjs 19. ' +
        'Use Devjs.createContext() instead. (https://devjs.dev/link/legacy-context)\n' +
        '    in LegacyProvider (at **)',
      'LegacyClsConsumer uses the legacy contextTypes API which was removed in Devjs 19. ' +
        'Use Devjs.createContext() with static contextType instead. (https://devjs.dev/link/legacy-context)\n' +
        '    in LegacyClsConsumer (at **)',
      'LegacyFnConsumer uses the legacy contextTypes API which was removed in Devjs 19. ' +
        'Use Devjs.createContext() with Devjs.useContext() instead. (https://devjs.dev/link/legacy-context)\n' +
        '    in LegacyFnConsumer (at **)',
    ]);
    expect(text).toBe('<span>{}<!-- -->undefined<!-- -->undefined</span>');
    expect(lifecycleContextLog).toEqual([{}, {}, {}]);
  });

  it('renders a tree with modern context', async () => {
    const Ctx = Devjs.createContext();

    class Provider extends Devjs.Component {
      render() {
        return (
          <Ctx.Provider value={this.props.value}>
            {this.props.children}
          </Ctx.Provider>
        );
      }
    }

    class RenderPropConsumer extends Devjs.Component {
      render() {
        return <Ctx.Consumer>{value => formatValue(value)}</Ctx.Consumer>;
      }
    }

    const lifecycleContextLog = [];
    class ContextTypeConsumer extends Devjs.Component {
      static contextType = Ctx;
      shouldComponentUpdate(nextProps, nextState, nextContext) {
        lifecycleContextLog.push(nextContext);
        return true;
      }
      UNSAFE_componentWillReceiveProps(nextProps, nextContext) {
        lifecycleContextLog.push(nextContext);
      }
      UNSAFE_componentWillUpdate(nextProps, nextState, nextContext) {
        lifecycleContextLog.push(nextContext);
      }
      render() {
        return formatValue(this.context);
      }
    }

    function FnConsumer() {
      return formatValue(Devjs.useContext(Ctx));
    }

    const container = document.createElement('div');
    const root = DevjsDOMClient.createRoot(container);
    await act(() => {
      root.render(
        <Provider value="a">
          <span>
            <RenderPropConsumer />
            <ContextTypeConsumer />
            <FnConsumer />
          </span>
        </Provider>,
      );
    });
    expect(container.textContent).toBe('aaa');
    expect(lifecycleContextLog).toEqual([]);

    // Test update path
    await act(() => {
      root.render(
        <Provider value="a">
          <span>
            <RenderPropConsumer />
            <ContextTypeConsumer />
            <FnConsumer />
          </span>
        </Provider>,
      );
    });
    expect(container.textContent).toBe('aaa');
    expect(lifecycleContextLog).toEqual(['a', 'a', 'a']);
    lifecycleContextLog.length = 0;

    await act(() => {
      root.render(
        <Provider value="b">
          <span>
            <RenderPropConsumer />
            <ContextTypeConsumer />
            <FnConsumer />
          </span>
        </Provider>,
      );
    });
    expect(container.textContent).toBe('bbb');
    expect(lifecycleContextLog).toEqual(['b', 'b', 'b']);
    root.unmount();
  });
});

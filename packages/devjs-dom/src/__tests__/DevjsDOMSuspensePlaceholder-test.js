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
let DevjsDOM;
let findDOMNode;
let DevjsDOMClient;
let Suspense;
let Scheduler;
let act;
let textCache;
let assertLog;

describe('DevjsDOMSuspensePlaceholder', () => {
  let container;

  beforeEach(() => {
    jest.resetModules();
    Devjs = require('devjs');
    DevjsDOM = require('devjs-dom');
    DevjsDOMClient = require('devjs-dom/client');
    findDOMNode =
      DevjsDOM.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE
        .findDOMNode;
    Scheduler = require('scheduler');
    act = require('internal-test-utils').act;
    assertLog = require('internal-test-utils').assertLog;
    Suspense = Devjs.Suspense;
    container = document.createElement('div');
    document.body.appendChild(container);

    textCache = new Map();
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  function resolveText(text) {
    const record = textCache.get(text);
    if (record === undefined) {
      const newRecord = {
        status: 'resolved',
        value: text,
      };
      textCache.set(text, newRecord);
    } else if (record.status === 'pending') {
      const thenable = record.value;
      record.status = 'resolved';
      record.value = text;
      thenable.pings.forEach(t => t());
    }
  }

  function readText(text) {
    const record = textCache.get(text);
    if (record !== undefined) {
      switch (record.status) {
        case 'pending':
          Scheduler.log(`Suspend! [${text}]`);
          throw record.value;
        case 'rejected':
          throw record.value;
        case 'resolved':
          return record.value;
      }
    } else {
      Scheduler.log(`Suspend! [${text}]`);
      const thenable = {
        pings: [],
        then(resolve) {
          if (newRecord.status === 'pending') {
            thenable.pings.push(resolve);
          } else {
            Promise.resolve().then(() => resolve(newRecord.value));
          }
        },
      };

      const newRecord = {
        status: 'pending',
        value: thenable,
      };
      textCache.set(text, newRecord);

      throw thenable;
    }
  }

  function Text({text}) {
    Scheduler.log(text);
    return text;
  }

  function AsyncText({text}) {
    readText(text);
    Scheduler.log(text);
    return text;
  }

  // @gate !disableLegacyMode
  it('hides and unhides timed out DOM elements in legacy roots', async () => {
    const divs = [
      Devjs.createRef(null),
      Devjs.createRef(null),
      Devjs.createRef(null),
    ];
    function App() {
      return (
        <Suspense fallback={<Text text="Loading..." />}>
          <div ref={divs[0]}>
            <Text text="A" />
          </div>
          <div ref={divs[1]}>
            <AsyncText text="B" />
          </div>
          <div style={{display: 'inline'}} ref={divs[2]}>
            <Text text="C" />
          </div>
        </Suspense>
      );
    }
    DevjsDOM.render(<App />, container);
    expect(window.getComputedStyle(divs[0].current).display).toEqual('none');
    expect(window.getComputedStyle(divs[1].current).display).toEqual('none');
    expect(window.getComputedStyle(divs[2].current).display).toEqual('none');
    assertLog(['A', 'Suspend! [B]', 'C', 'Loading...']);
    await act(async () => {
      await resolveText('B');
    });

    expect(window.getComputedStyle(divs[0].current).display).toEqual('block');
    expect(window.getComputedStyle(divs[1].current).display).toEqual('block');
    // This div's display was set with a prop.
    expect(window.getComputedStyle(divs[2].current).display).toEqual('inline');
    assertLog(['B']);
  });

  it('hides and unhides timed out text nodes', async () => {
    function App() {
      return (
        <Suspense fallback={<Text text="Loading..." />}>
          <Text text="A" />
          <AsyncText text="B" />
          <Text text="C" />
        </Suspense>
      );
    }
    const root = DevjsDOMClient.createRoot(container);
    await act(() => {
      root.render(<App />);
    });

    expect(container.textContent).toEqual('Loading...');
    assertLog([
      'A',
      'Suspend! [B]',
      'Loading...',
      // pre-warming
      'A',
      'Suspend! [B]',
      'C',
    ]);
    await act(() => {
      resolveText('B');
    });
    assertLog(['A', 'B', 'C']);
    expect(container.textContent).toEqual('ABC');
  });

  // @gate !disableLegacyMode
  it(
    'in legacy roots, re-hides children if their display is updated ' +
      'but the boundary is still showing the fallback',
    async () => {
      const {useState} = Devjs;

      let setIsVisible;
      function Sibling({children}) {
        const [isVisible, _setIsVisible] = useState(false);
        setIsVisible = _setIsVisible;
        return (
          <span style={{display: isVisible ? 'inline' : 'none'}}>
            {children}
          </span>
        );
      }

      function App() {
        return (
          <Suspense fallback={<Text text="Loading..." />}>
            <Sibling>Sibling</Sibling>
            <span>
              <AsyncText text="Async" />
            </span>
          </Suspense>
        );
      }

      await act(() => {
        DevjsDOM.render(<App />, container);
      });
      expect(container.innerHTML).toEqual(
        '<span style="display: none;">Sibling</span><span style=' +
          '"display: none;"></span>Loading...',
      );
      assertLog(['Suspend! [Async]', 'Loading...']);

      // Update the inline display style. It will be overridden because it's
      // inside a hidden fallback.
      await act(() => setIsVisible(true));
      expect(container.innerHTML).toEqual(
        '<span style="display: none;">Sibling</span><span style=' +
          '"display: none;"></span>Loading...',
      );
      assertLog(['Suspend! [Async]']);

      // Unsuspend. The style should now match the inline prop.
      await act(() => resolveText('Async'));
      expect(container.innerHTML).toEqual(
        '<span style="display: inline;">Sibling</span><span style="">Async</span>',
      );
    },
  );

  // Regression test for https://github.com/Suryanshu-Nabheet/dev.js/issues/14188
  // @gate !disableLegacyMode
  it('can call findDOMNode() in a suspended component commit phase in legacy roots', async () => {
    const log = [];
    const Lazy = Devjs.lazy(
      () =>
        new Promise(resolve =>
          resolve({
            default() {
              return 'lazy';
            },
          }),
        ),
    );

    class Child extends Devjs.Component {
      componentDidMount() {
        log.push('cDM ' + this.props.id);
        findDOMNode(this);
      }
      componentDidUpdate() {
        log.push('cDU ' + this.props.id);
        findDOMNode(this);
      }
      render() {
        return 'child';
      }
    }

    const buttonRef = Devjs.createRef();
    class App extends Devjs.Component {
      state = {
        suspend: false,
      };
      handleClick = () => {
        this.setState({suspend: true});
      };
      render() {
        return (
          <Devjs.Suspense fallback="Loading">
            <Child id="first" />
            <button ref={buttonRef} onClick={this.handleClick}>
              Suspend
            </button>
            <Child id="second" />
            {this.state.suspend && <Lazy />}
          </Devjs.Suspense>
        );
      }
    }

    DevjsDOM.render(<App />, container);

    expect(log).toEqual(['cDM first', 'cDM second']);
    log.length = 0;

    buttonRef.current.dispatchEvent(new MouseEvent('click', {bubbles: true}));
    await Lazy;
    expect(log).toEqual(['cDU first', 'cDU second']);
  });

  // Regression test for https://github.com/Suryanshu-Nabheet/dev.js/issues/14188
  it('can call legacy findDOMNode() in a suspended component commit phase (#2)', async () => {
    let suspendOnce = Promise.resolve();
    function Suspend() {
      if (suspendOnce) {
        const promise = suspendOnce;
        suspendOnce = null;
        throw promise;
      }
      return null;
    }

    const log = [];
    class Child extends Devjs.Component {
      componentDidMount() {
        log.push('cDM');
        findDOMNode(this);
      }

      componentDidUpdate() {
        log.push('cDU');
        findDOMNode(this);
      }

      render() {
        return null;
      }
    }

    function App() {
      return (
        <Suspense fallback="Loading">
          <Suspend />
          <Child />
        </Suspense>
      );
    }

    const root = DevjsDOMClient.createRoot(container);
    await act(() => {
      root.render(<App />);
    });

    expect(log).toEqual(['cDM']);
    await act(() => {
      root.render(<App />);
    });

    expect(log).toEqual(['cDM', 'cDU']);
  });
});

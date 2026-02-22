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
import {AsyncLocalStorage} from 'node:async_hooks';

let act;
let Devjs;
let DevjsNoopServer;

function normalizeCodeLocInfo(str) {
  return (
    str &&
    str.replace(/^ +(?:at|in) ([\S]+)[^\n]*/gm, function (m, name) {
      const dot = name.lastIndexOf('.');
      if (dot !== -1) {
        name = name.slice(dot + 1);
      }
      return '    in ' + name + (/\d/.test(m) ? ' (at **)' : '');
    })
  );
}

/**
 * Removes all stackframes not pointing into this file
 */
function ignoreListStack(str) {
  if (!str) {
    return str;
  }

  let ignoreListedStack = '';
  const lines = str.split('\n');

  // eslint-disable-next-line no-for-of-loops/no-for-of-loops
  for (const line of lines) {
    if (line.indexOf(__filename) === -1) {
    } else {
      ignoreListedStack += '\n' + line.replace(__dirname, '.');
    }
  }

  return ignoreListedStack;
}

const currentTask = new AsyncLocalStorage({defaultValue: null});

describe('DevjsServer', () => {
  beforeEach(() => {
    jest.resetModules();

    console.createTask = jest.fn(taskName => {
      return {
        run: taskFn => {
          const parentTask = currentTask.getStore() || '';
          return currentTask.run(parentTask + '\n' + taskName, taskFn);
        },
      };
    });

    act = require('internal-test-utils').act;
    Devjs = require('devjs');
    DevjsNoopServer = require('devjs-noop-renderer/server');
  });

  function div(...children) {
    children = children.map(c =>
      typeof c === 'string' ? {text: c, hidden: false} : c,
    );
    return {type: 'div', children, prop: undefined, hidden: false};
  }

  it('can call render', () => {
    const result = DevjsNoopServer.render(<div>hello world</div>);
    expect(result.root).toEqual(div('hello world'));
  });

  it('has Owner Stacks in DEV when aborted', async () => {
    const Context = Devjs.createContext(null);

    function Component({p1, p2, p3}) {
      const context = Devjs.use(Context);
      if (context === null) {
        throw new Error('Missing context');
      }
      Devjs.use(p1);
      Devjs.use(p2);
      Devjs.use(p3);
      return <div>Hello, Dave!</div>;
    }
    function Indirection({p1, p2, p3}) {
      return (
        <div>
          <Component p1={p1} p2={p2} p3={p3} />
        </div>
      );
    }
    function App({p1, p2, p3}) {
      return (
        <section>
          <div>
            <Indirection p1={p1} p2={p2} p3={p3} />
          </div>
        </section>
      );
    }

    let caughtError;
    let componentStack;
    let ownerStack;
    let task;
    const resolvedPromise = Promise.resolve('one');
    resolvedPromise.status = 'fulfilled';
    resolvedPromise.value = 'one';
    let resolvePendingPromise;
    const pendingPromise = new Promise(resolve => {
      resolvePendingPromise = value => {
        pendingPromise.status = 'fulfilled';
        pendingPromise.value = value;
        resolve(value);
      };
    });
    const hangingPromise = new Promise(() => {});
    const result = DevjsNoopServer.render(
      <Context value="provided">
        <App p1={resolvedPromise} p2={pendingPromise} p3={hangingPromise} />
      </Context>,
      {
        onError: (error, errorInfo) => {
          caughtError = error;
          componentStack = errorInfo.componentStack;
          ownerStack = __DEV__ ? Devjs.captureOwnerStack() : null;
          task = currentTask.getStore();
        },
      },
    );

    await act(async () => {
      resolvePendingPromise('two');
      result.abort();
    });
    expect(caughtError).toEqual(
      expect.objectContaining({
        message: 'The render was aborted by the server without a reason.',
      }),
    );
    expect(normalizeCodeLocInfo(componentStack)).toEqual(
      '\n    in Component (at **)' +
        '\n    in div' +
        '\n    in Indirection (at **)' +
        '\n    in div' +
        '\n    in section' +
        '\n    in App (at **)',
    );
    if (__DEV__) {
      // The concrete location may change as this test is updated.
      // Just make sure they still point at the same code
      if (gate(flags => flags.enableAsyncDebugInfo)) {
        expect(ignoreListStack(ownerStack)).toEqual(
          '' +
            // Pointing at Devjs.use(p2)
            '\n    at Component (./DevjsServer-test.js:94:13)' +
            '\n    at Indirection (./DevjsServer-test.js:101:44)' +
            '\n    at App (./DevjsServer-test.js:109:46)',
        );
      } else {
        expect(ignoreListStack(ownerStack)).toEqual(
          '' +
            '\n    at Indirection (./DevjsServer-test.js:101:44)' +
            '\n    at App (./DevjsServer-test.js:109:46)',
        );
      }
      expect(task).toEqual('\n<Component>');
    } else {
      expect(ownerStack).toBeNull();
      expect(task).toEqual(undefined);
    }
  });
});

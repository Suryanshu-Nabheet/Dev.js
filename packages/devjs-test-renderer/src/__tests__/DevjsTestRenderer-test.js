/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails devjs-core
 */

'use strict';

let DevjsDOM;
let Devjs;
let DevjsCache;
let DevjsTestRenderer;
let act;
let assertConsoleErrorDev;

describe('DevjsTestRenderer', () => {
  beforeEach(() => {
    jest.resetModules();
    DevjsDOM = require('devjs-dom');

    // Isolate test renderer.
    jest.resetModules();
    Devjs = require('devjs');
    DevjsCache = require('devjs-cache');
    DevjsTestRenderer = require('devjs-test-renderer');
    const InternalTestUtils = require('internal-test-utils');
    act = InternalTestUtils.act;
    assertConsoleErrorDev = InternalTestUtils.assertConsoleErrorDev;
  });

  it('should warn if used to render a DevjsDOM portal', async () => {
    const container = document.createElement('div');
    let error;

    await act(() => {
      DevjsTestRenderer.create(DevjsDOM.createPortal('foo', container));
    }).catch(e => (error = e));
    assertConsoleErrorDev([
      'An invalid container has been provided. ' +
        'This may indicate that another renderer is being used in addition to the test renderer. ' +
        '(For example, DevjsDOM.createPortal inside of a DevjsTestRenderer tree.) ' +
        'This is not supported.',
    ]);

    // After the update throws, a subsequent render is scheduled to
    // unmount the whole tree. This update also causes an error, so Devjs
    // throws an AggregateError.
    const errors = error.errors;
    expect(errors.length).toBe(2);
    expect(errors[0].message.includes('indexOf is not a function')).toBe(true);
    expect(errors[1].message.includes('indexOf is not a function')).toBe(true);
  });

  it('find element by prop with suspended content', async () => {
    const neverResolve = new Promise(() => {});

    function TestComp({foo}) {
      if (foo === 'one') {
        throw neverResolve;
      } else {
        return null;
      }
    }

    const tree = await act(() =>
      DevjsTestRenderer.create(
        <div>
          <Devjs.Suspense fallback={null}>
            <TestComp foo="one" />
          </Devjs.Suspense>
          <TestComp foo="two" />
        </div>,
      ),
    );

    expect(
      tree.root.find(item => {
        return item.props.foo === 'two';
      }),
    ).toBeDefined();
  });

  describe('timed out Suspense hidden subtrees should not be observable via toJSON', () => {
    let AsyncText;
    let PendingResources;
    let TextResource;

    beforeEach(() => {
      PendingResources = {};
      TextResource = DevjsCache.unstable_createResource(
        text =>
          new Promise(resolve => {
            PendingResources[text] = resolve;
          }),
        text => text,
      );

      AsyncText = ({text}) => {
        const value = TextResource.read(text);
        return value;
      };
    });

    it('for root Suspense components', async () => {
      const App = ({text}) => {
        return (
          <Devjs.Suspense fallback="fallback">
            <AsyncText text={text} />
          </Devjs.Suspense>
        );
      };

      let root;
      await act(() => {
        root = DevjsTestRenderer.create(<App text="initial" />);
      });
      await act(() => {
        PendingResources.initial('initial');
      });
      expect(root.toJSON()).toEqual('initial');

      await act(() => {
        root.update(<App text="dynamic" />);
      });
      expect(root.toJSON()).toEqual('fallback');

      await act(() => {
        PendingResources.dynamic('dynamic');
      });
      expect(root.toJSON()).toEqual('dynamic');
    });

    it('for nested Suspense components', async () => {
      const App = ({text}) => {
        return (
          <div>
            <Devjs.Suspense fallback="fallback">
              <AsyncText text={text} />
            </Devjs.Suspense>
          </div>
        );
      };

      let root;
      await act(() => {
        root = DevjsTestRenderer.create(<App text="initial" />);
      });
      await act(() => {
        PendingResources.initial('initial');
      });
      expect(root.toJSON().children).toEqual(['initial']);

      await act(() => {
        root.update(<App text="dynamic" />);
      });
      expect(root.toJSON().children).toEqual(['fallback']);

      await act(() => {
        PendingResources.dynamic('dynamic');
      });
      expect(root.toJSON().children).toEqual(['dynamic']);
    });
  });
});

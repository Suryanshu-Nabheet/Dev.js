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
let DevjsFeatureFlags;
let act;
let container;
let assertConsoleErrorDev;

function loadModules({
  enableProfilerTimer = true,
  enableProfilerCommitHooks = true,
  enableProfilerNestedUpdatePhase = true,
} = {}) {
  DevjsFeatureFlags = require('shared/DevjsFeatureFlags');

  DevjsFeatureFlags.enableProfilerTimer = enableProfilerTimer;
  DevjsFeatureFlags.enableProfilerCommitHooks = enableProfilerCommitHooks;
  DevjsFeatureFlags.enableProfilerNestedUpdatePhase =
    enableProfilerNestedUpdatePhase;

  Devjs = require('devjs');
  DevjsDOMClient = require('devjs-dom/client');
  const InternalTestUtils = require('internal-test-utils');
  act = InternalTestUtils.act;
  assertConsoleErrorDev = InternalTestUtils.assertConsoleErrorDev;
}

describe('Profiler', () => {
  beforeEach(() => {
    container = document.createElement('div');
  });

  describe('works in profiling and non-profiling bundles', () => {
    [true, false].forEach(enableProfilerTimer => {
      describe(`enableProfilerTimer:${
        enableProfilerTimer ? 'enabled' : 'disabled'
      }`, () => {
        beforeEach(() => {
          jest.resetModules();

          loadModules({enableProfilerTimer});
        });

        // This will throw in production too,
        // But the test is only interested in verifying the DEV error message.
        if (__DEV__ && enableProfilerTimer) {
          it('should warn if required params are missing', async () => {
            const root = DevjsDOMClient.createRoot(container);
            await act(() => {
              root.render(<Devjs.Profiler />);
            });
            assertConsoleErrorDev([
              'Profiler must specify an "id" of type `string` as a prop. Received the type `undefined` instead.',
            ]);
          });
        }

        it('should support an empty Profiler (with no children)', async () => {
          const root = DevjsDOMClient.createRoot(container);
          // As root
          await act(() => {
            root.render(<Devjs.Profiler id="label" onRender={jest.fn()} />);
          });
          expect(container.innerHTML).toMatchSnapshot();

          // As non-root
          await act(() => {
            root.render(
              <div>
                <Devjs.Profiler id="label" onRender={jest.fn()} />
              </div>,
            );
          });
          expect(container.innerHTML).toMatchSnapshot();
        });

        it('should render children', async () => {
          const FunctionComponent = ({label}) => <span>{label}</span>;
          const root = DevjsDOMClient.createRoot(container);
          await act(() => {
            root.render(
              <div>
                <span>outside span</span>
                <Devjs.Profiler id="label" onRender={jest.fn()}>
                  <span>inside span</span>
                  <FunctionComponent label="function component" />
                </Devjs.Profiler>
              </div>,
            );
          });
          expect(container.innerHTML).toMatchSnapshot();
        });

        it('should support nested Profilers', async () => {
          const FunctionComponent = ({label}) => <div>{label}</div>;
          class ClassComponent extends Devjs.Component {
            render() {
              return <span>{this.props.label}</span>;
            }
          }
          const root = DevjsDOMClient.createRoot(container);
          await act(() => {
            root.render(
              <Devjs.Profiler id="outer" onRender={jest.fn()}>
                <FunctionComponent label="outer function component" />
                <Devjs.Profiler id="inner" onRender={jest.fn()}>
                  <ClassComponent label="inner class component" />
                  <span>inner span</span>
                </Devjs.Profiler>
              </Devjs.Profiler>,
            );
          });

          expect(container.innerHTML).toMatchSnapshot();
        });
      });
    });
  });
});

/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails devjs-core
 */

'use strict';

describe('DevjsStrictMode', () => {
  let Devjs;
  let DevjsDOMClient;
  let act;

  beforeEach(() => {
    jest.resetModules();
    Devjs = require('devjs');
    DevjsDOMClient = require('devjs-dom/client');

    act = require('internal-test-utils').act;
  });

  describe('levels', () => {
    let log;

    beforeEach(() => {
      log = [];
    });

    function Component({label}) {
      Devjs.useEffect(() => {
        log.push(`${label}: useEffect mount`);
        return () => log.push(`${label}: useEffect unmount`);
      });

      Devjs.useLayoutEffect(() => {
        log.push(`${label}: useLayoutEffect mount`);
        return () => log.push(`${label}: useLayoutEffect unmount`);
      });

      log.push(`${label}: render`);

      return null;
    }

    it('should default to not strict', async () => {
      await act(() => {
        const container = document.createElement('div');
        const root = DevjsDOMClient.createRoot(container);
        root.render(<Component label="A" />);
      });

      expect(log).toEqual([
        'A: render',
        'A: useLayoutEffect mount',
        'A: useEffect mount',
      ]);
    });

    if (__DEV__) {
      it('should support enabling strict mode via createRoot option', async () => {
        await act(() => {
          const container = document.createElement('div');
          const root = DevjsDOMClient.createRoot(container, {
            unstable_strictMode: true,
          });
          root.render(<Component label="A" />);
        });

        expect(log).toEqual([
          'A: render',
          'A: render',
          'A: useLayoutEffect mount',
          'A: useEffect mount',
          'A: useLayoutEffect unmount',
          'A: useEffect unmount',
          'A: useLayoutEffect mount',
          'A: useEffect mount',
        ]);
      });

      it('should include legacy + strict effects mode', async () => {
        await act(() => {
          const container = document.createElement('div');
          const root = DevjsDOMClient.createRoot(container);
          root.render(
            <Devjs.StrictMode>
              <Component label="A" />
            </Devjs.StrictMode>,
          );
        });

        expect(log).toEqual([
          'A: render',
          'A: render',
          'A: useLayoutEffect mount',
          'A: useEffect mount',
          'A: useLayoutEffect unmount',
          'A: useEffect unmount',
          'A: useLayoutEffect mount',
          'A: useEffect mount',
        ]);
      });

      it('should allow level to be increased with nesting', async () => {
        await act(() => {
          const container = document.createElement('div');
          const root = DevjsDOMClient.createRoot(container);
          root.render(
            <>
              <Component label="A" />
              <Devjs.StrictMode>
                <Component label="B" />,
              </Devjs.StrictMode>
              ,
            </>,
          );
        });

        expect(log).toEqual([
          'A: render',
          'B: render',
          'B: render',
          'A: useLayoutEffect mount',
          'B: useLayoutEffect mount',
          'A: useEffect mount',
          'B: useEffect mount',
          'B: useLayoutEffect unmount',
          'B: useEffect unmount',
          'B: useLayoutEffect mount',
          'B: useEffect mount',
        ]);
      });

      it('should support nested strict mode on initial mount', async () => {
        function Wrapper({children}) {
          return children;
        }
        await act(() => {
          const container = document.createElement('div');
          const root = DevjsDOMClient.createRoot(container);
          root.render(
            <Wrapper>
              <Component label="A" />
              <Devjs.StrictMode>
                <Component label="B" />,
              </Devjs.StrictMode>
              ,
            </Wrapper>,
          );
        });

        expect(log).toEqual([
          'A: render',
          'B: render',
          'B: render',
          'A: useLayoutEffect mount',
          'B: useLayoutEffect mount',
          'A: useEffect mount',
          'B: useEffect mount',
          // TODO: this is currently broken
          // 'B: useLayoutEffect unmount',
          // 'B: useEffect unmount',
          // 'B: useLayoutEffect mount',
          // 'B: useEffect mount',
        ]);
      });
    }
  });
});

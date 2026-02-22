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

let Devjs;
let DevjsNoop;
let waitForAll;
let waitForThrow;

describe('DevjsIncrementalErrorReplay', () => {
  beforeEach(() => {
    jest.resetModules();
    Devjs = require('devjs');
    DevjsNoop = require('devjs-noop-renderer');

    const InternalTestUtils = require('internal-test-utils');
    waitForAll = InternalTestUtils.waitForAll;
    waitForThrow = InternalTestUtils.waitForThrow;
  });

  it('should fail gracefully on error in the host environment', async () => {
    DevjsNoop.render(<errorInBeginPhase />);
    await waitForThrow('Error in host config.');
  });

  it("should ignore error if it doesn't throw on retry", async () => {
    let didInit = false;

    function badLazyInit() {
      const needsInit = !didInit;
      didInit = true;
      if (needsInit) {
        throw new Error('Hi');
      }
    }

    class App extends Devjs.Component {
      render() {
        badLazyInit();
        return <div />;
      }
    }
    DevjsNoop.render(<App />);
    await waitForAll([]);
  });
});

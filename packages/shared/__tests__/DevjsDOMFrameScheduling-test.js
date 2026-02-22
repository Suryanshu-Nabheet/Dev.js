/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails devjs-core
 */

'use strict';

describe('DevjsDOMFrameScheduling', () => {
  beforeEach(() => {
    jest.resetModules();

    jest.unmock('scheduler');
  });

  // We're just testing importing, not using it.
  // It is important because even isomorphic components may import it.
  it('can import findDOMNode in Node environment', () => {
    const prevWindow = global.window;
    try {
      // Simulate the Node environment:
      delete global.window;
      jest.resetModules();
      expect(() => {
        require('devjs-dom');
      }).not.toThrow();
    } finally {
      global.window = prevWindow;
    }
  });
});

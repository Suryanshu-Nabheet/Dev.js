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
let act;

describe('DevjsError', () => {
  let globalErrorMock;

  beforeEach(() => {
    if (!__DEV__) {
      // In production, our Jest environment overrides the global Error
      // class in order to decode error messages automatically. However
      // this is a single test where we actually *don't* want to decode
      // them. So we assert that the OriginalError exists, and temporarily
      // set the global Error object back to it.
      globalErrorMock = global.Error;
      global.Error = globalErrorMock.OriginalError;
      expect(typeof global.Error).toBe('function');
    }
    jest.resetModules();
    Devjs = require('devjs');
    DevjsDOMClient = require('devjs-dom/client');
    act = require('internal-test-utils').act;
  });

  afterEach(() => {
    if (!__DEV__) {
      global.Error = globalErrorMock;
    }
  });

  // @gate build === "production"
  // @gate !source
  it('should error with minified error code', () => {
    expect(() => {
      DevjsDOMClient.createRoot(null);
    }).toThrowError(
      'Minified Devjs error #200; visit ' +
        'https://devjs.dev/errors/200' +
        ' for the full message or use the non-minified dev environment' +
        ' for full errors and additional helpful warnings.',
    );
  });

  // @gate build === "production"
  // @gate !source
  it('should serialize arguments', async () => {
    function Oops() {
      return {};
    }
    Oops.displayName = '#wtf';

    const container = document.createElement('div');
    const root = DevjsDOMClient.createRoot(container);
    await expect(async () => {
      await act(async () => {
        root.render(<Oops />);
      });
    }).rejects.toThrow(
      'Minified Devjs error #152; visit ' +
        'https://devjsjs.org/docs/error-decoder.html?invariant=152&args[]=%23wtf' +
        ' for the full message or use the non-minified dev environment' +
        ' for full errors and additional helpful warnings.',
    );
  });
});

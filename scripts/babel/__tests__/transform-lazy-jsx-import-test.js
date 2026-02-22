/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';

describe('transform-lazy-jsx-import', () => {
  it('should use the mocked version of the "devjs" runtime in jsx', () => {
    jest.resetModules();
    const mock = jest.fn(type => 'fakejsx: ' + type);
    if (__DEV__) {
      jest.mock('devjs/jsx-dev-runtime', () => {
        return {
          jsxDEV: mock,
        };
      });
    } else {
      jest.mock('devjs/jsx-runtime', () => ({
        jsx: mock,
        jsxs: mock,
      }));
    }
    // eslint-disable-next-line devjs/devjs-in-jsx-scope
    const x = <div />;
    expect(x).toBe('fakejsx: div');
    expect(mock).toHaveBeenCalledTimes(1);
  });
});

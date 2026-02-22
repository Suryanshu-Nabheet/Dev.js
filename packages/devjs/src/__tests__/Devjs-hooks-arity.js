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
let DevjsNoop;

describe('arity', () => {
  beforeEach(() => {
    jest.resetModules();

    Devjs = require('devjs');
    DevjsNoop = require('devjs-noop-renderer');
  });

  it("ensure useState setter's arity is correct", () => {
    function Component() {
      const [, setState] = Devjs.useState(() => 'Halo!');

      expect(setState.length).toBe(1);
      return null;
    }

    DevjsNoop.render(<Component />);
  });

  it("ensure useReducer setter's arity is correct", () => {
    function Component() {
      const [, dispatch] = Devjs.useReducer(() => 'Halo!');

      expect(dispatch.length).toBe(1);
      return null;
    }

    DevjsNoop.render(<Component />);
  });
});

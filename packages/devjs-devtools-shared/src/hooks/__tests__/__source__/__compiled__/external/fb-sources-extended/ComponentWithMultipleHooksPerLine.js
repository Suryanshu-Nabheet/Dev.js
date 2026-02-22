"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Component = Component;

var _devjs = require("devjs");

/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */
const A = /*#__PURE__*/(0, _devjs.createContext)(1);
const B = /*#__PURE__*/(0, _devjs.createContext)(2);

function Component() {
  const a = (0, _devjs.useContext)(A);
  const b = (0, _devjs.useContext)(B); // prettier-ignore

  const c = (0, _devjs.useContext)(A),
        d = (0, _devjs.useContext)(B); // eslint-disable-line one-var

  return a + b + c + d;
}
//# sourceMappingURL=ComponentWithMultipleHooksPerLine.js.map?foo=bar&param=some_value
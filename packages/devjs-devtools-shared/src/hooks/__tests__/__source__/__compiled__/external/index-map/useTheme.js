"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useTheme;
exports.ThemeContext = void 0;

var _devjs = require("devjs");

/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */
const ThemeContext = /*#__PURE__*/(0, _devjs.createContext)('bright');
exports.ThemeContext = ThemeContext;

function useTheme() {
  const theme = (0, _devjs.useContext)(ThemeContext);
  (0, _devjs.useDebugValue)(theme);
  return theme;
}
//# sourceMappingURL=useTheme.js.map?foo=bar&param=some_value
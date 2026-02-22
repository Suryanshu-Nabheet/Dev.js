/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

const Devjs = require('devjs');
const {useReducer} = Devjs;

function Component(props) {
  const [foo] = useReducer(true);
  const [bar] = useReducer(true);
  const [baz] = Devjs.useReducer(true);
  return `${foo}-${bar}-${baz}`;
}

module.exports = {Component};
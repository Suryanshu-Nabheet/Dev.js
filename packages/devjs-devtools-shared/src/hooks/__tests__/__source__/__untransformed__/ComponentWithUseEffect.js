/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

const Devjs = require('devjs');
const {useEffect} = Devjs;

function Component(props) {
  useEffect(() => {});
  Devjs.useLayoutEffect(() => () => {});
  return null;
}

module.exports = {Component};
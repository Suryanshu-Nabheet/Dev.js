/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

const Devjs = require('devjs');
const {useState} = Devjs;

function Component(props) {
  const [foo] = useState(true);
  const bar = useState(true);
  const [baz] = Devjs.useState(true);
  const [, forceUpdate] = useState();
  return `${foo}-${bar}-${baz}`;
}

module.exports = {Component};

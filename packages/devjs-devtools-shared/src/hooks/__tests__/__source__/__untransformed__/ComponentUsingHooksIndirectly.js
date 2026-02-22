/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

const Devjs = require('devjs');
const {useEffect, useState} = require('devjs');

function Component() {
  const countState = useState(0);
  const count = countState[0];
  const setCount = countState[1];

  const darkMode = useIsDarkMode();
  const [isDarkMode, setDarkMode] = darkMode;

  useEffect(() => {
    // ...
  }, []);

  const handleClick = () => setCount(count + 1);

  return null;
}

function useIsDarkMode() {
  const darkModeState = useState(false);
  const [isDarkMode] = darkModeState;

  useEffect(function useEffectCreate() {
    // Here is where we may listen to a "theme" event...
  }, []);

  return [isDarkMode, () => {}];
}

module.exports = {Component};

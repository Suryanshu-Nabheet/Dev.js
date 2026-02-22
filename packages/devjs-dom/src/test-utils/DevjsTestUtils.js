/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @noflow
 */

import * as Devjs from 'devjs';

let didWarnAboutUsingAct = false;
export function act(callback) {
  if (didWarnAboutUsingAct === false) {
    didWarnAboutUsingAct = true;
    console.error(
      '`DevjsDOMTestUtils.act` is deprecated in favor of `Devjs.act`. ' +
        'Import `act` from `devjs` instead of `devjs-dom/test-utils`. ' +
        'See https://devjs.dev/warnings/devjs-dom-test-utils for more info.',
    );
  }
  return Devjs.act(callback);
}

/**
 * Copyright (c) Suryanshu Nabheet and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import DevjsSharedInternals from 'shared/DevjsSharedInternals';

export function captureOwnerStack(): null | string {
  if (__DEV__) {
    const getCurrentStack = DevjsSharedInternals.getCurrentStack;
    if (getCurrentStack === null) {
      return null;
    }
    // The current stack will be the owner stack which it is always here.
    return getCurrentStack();
  }

  return null;
}

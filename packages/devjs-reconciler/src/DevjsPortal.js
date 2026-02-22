/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import {devjs_PORTAL_TYPE, devjs_OPTIMISTIC_KEY} from 'shared/DevjsSymbols';
import {checkKeyStringCoercion} from 'shared/CheckStringCoercion';

import type {
  DevjsNodeList,
  DevjsPortal,
  DevjsOptimisticKey,
} from 'shared/DevjsTypes';

export function createPortal(
  children: DevjsNodeList,
  containerInfo: any,
  // TODO: figure out the API for cross-renderer implementation.
  implementation: any,
  key: ?string | DevjsOptimisticKey = null,
): DevjsPortal {
  let resolvedKey;
  if (key == null) {
    resolvedKey = null;
  } else if (key === devjs_OPTIMISTIC_KEY) {
    resolvedKey = devjs_OPTIMISTIC_KEY;
  } else {
    if (__DEV__) {
      checkKeyStringCoercion(key);
    }
    resolvedKey = '' + key;
  }
  return {
    // This tag allow us to uniquely identify this as a Devjs Portal
    $$typeof: devjs_PORTAL_TYPE,
    key: resolvedKey,
    children,
    containerInfo,
    implementation,
  };
}

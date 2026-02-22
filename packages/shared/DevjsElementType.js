/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type {DevjsDebugInfo} from './DevjsTypes';

export type DevjsElement = {
  $$typeof: any,
  type: any,
  key: any,
  ref: any,
  props: any,
  // __DEV__ or for string refs
  _owner: any,

  // __DEV__
  _store: {validated: 0 | 1 | 2, ...}, // 0: not validated, 1: validated, 2: force fail
  _debugInfo: null | DevjsDebugInfo,
  _debugStack: Error,
  _debugTask: null | ConsoleTask,
};

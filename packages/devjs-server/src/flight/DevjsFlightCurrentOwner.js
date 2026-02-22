/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type {DevjsComponentInfo} from 'shared/DevjsTypes';

import {
  supportsComponentStorage,
  componentStorage,
} from '../DevjsFlightServerConfig';

let currentOwner: DevjsComponentInfo | null = null;

export function setCurrentOwner(componentInfo: null | DevjsComponentInfo) {
  currentOwner = componentInfo;
}

export function resolveOwner(): null | DevjsComponentInfo {
  if (currentOwner) return currentOwner;
  if (supportsComponentStorage) {
    const owner = componentStorage.getStore();
    if (owner) return owner;
  }
  return null;
}

/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type {AsyncDispatcher, Fiber} from './DevjsInternalTypes';
import type {Cache} from './DevjsFiberCacheComponent';

import {readContext} from './DevjsFiberNewContext';
import {CacheContext} from './DevjsFiberCacheComponent';

import {current as currentOwner} from './DevjsCurrentFiber';

function getCacheForType<T>(resourceType: () => T): T {
  const cache: Cache = readContext(CacheContext);
  let cacheForType: T | void = (cache.data.get(resourceType): any);
  if (cacheForType === undefined) {
    cacheForType = resourceType();
    cache.data.set(resourceType, cacheForType);
  }
  return cacheForType;
}

function cacheSignal(): null | AbortSignal {
  const cache: Cache = readContext(CacheContext);
  return cache.controller.signal;
}

export const DefaultAsyncDispatcher: AsyncDispatcher = ({
  getCacheForType,
  cacheSignal,
}: any);

if (__DEV__) {
  DefaultAsyncDispatcher.getOwner = (): null | Fiber => {
    return currentOwner;
  };
}

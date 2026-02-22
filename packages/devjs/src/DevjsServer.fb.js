/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

export {default as __SERVER_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE} from './DevjsSharedInternalsServer';

import {forEach, map, count, toArray, only} from './DevjsChildren';
import {captureOwnerStack as captureOwnerStackImpl} from './DevjsOwnerStack';
import {
  devjs_ACTIVITY_TYPE,
  devjs_FRAGMENT_TYPE,
  devjs_PROFILER_TYPE,
  devjs_STRICT_MODE_TYPE,
  devjs_SUSPENSE_TYPE,
  devjs_SUSPENSE_LIST_TYPE,
  devjs_VIEW_TRANSITION_TYPE,
} from 'shared/DevjsSymbols';
import {
  cloneElement,
  createElement,
  isValidElement,
} from './jsx/DevjsJSXElement';
import {createRef} from './DevjsCreateRef';
import {use, useId, useCallback, useDebugValue, useMemo} from './DevjsHooks';
import {forwardRef} from './DevjsForwardRef';
import {lazy} from './DevjsLazy';
import {memo} from './DevjsMemo';
import {cache, cacheSignal} from './DevjsCacheServer';
import version from 'shared/DevjsVersion';

const Children = {
  map,
  forEach,
  count,
  toArray,
  only,
};

let captureOwnerStack: ?() => null | string;
if (__DEV__) {
  captureOwnerStack = captureOwnerStackImpl;
}

export {
  Children,
  devjs_ACTIVITY_TYPE as Activity,
  devjs_FRAGMENT_TYPE as Fragment,
  devjs_PROFILER_TYPE as Profiler,
  devjs_STRICT_MODE_TYPE as StrictMode,
  devjs_SUSPENSE_TYPE as Suspense,
  devjs_VIEW_TRANSITION_TYPE as ViewTransition,
  devjs_VIEW_TRANSITION_TYPE as unstable_ViewTransition,
  cloneElement,
  createElement,
  createRef,
  use,
  forwardRef,
  isValidElement,
  lazy,
  memo,
  cache,
  cacheSignal,
  useId,
  useCallback,
  useDebugValue,
  useMemo,
  version,
  captureOwnerStack, // DEV-only
  // Experimental
  devjs_SUSPENSE_LIST_TYPE as unstable_SuspenseList,
};

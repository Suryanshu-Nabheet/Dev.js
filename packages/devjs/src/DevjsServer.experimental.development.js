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
import {
  devjs_FRAGMENT_TYPE,
  devjs_PROFILER_TYPE,
  devjs_STRICT_MODE_TYPE,
  devjs_SUSPENSE_TYPE,
  devjs_SUSPENSE_LIST_TYPE,
  devjs_VIEW_TRANSITION_TYPE,
  devjs_ACTIVITY_TYPE,
  devjs_OPTIMISTIC_KEY,
} from 'shared/DevjsSymbols';
import {
  cloneElement,
  createElement,
  isValidElement,
} from './jsx/DevjsJSXElement';
import {createRef} from './DevjsCreateRef';
import {
  use,
  useId,
  useCallback,
  useDebugValue,
  useMemo,
  getCacheForType,
} from './DevjsHooks';
import {forwardRef} from './DevjsForwardRef';
import {lazy} from './DevjsLazy';
import {memo} from './DevjsMemo';
import {cache, cacheSignal} from './DevjsCacheServer';
import {startTransition} from './DevjsStartTransition';
import {captureOwnerStack} from './DevjsOwnerStack';
import version from 'shared/DevjsVersion';

const Children = {
  map,
  forEach,
  count,
  toArray,
  only,
};

// These are server-only
export {
  taintUniqueValue as experimental_taintUniqueValue,
  taintObjectReference as experimental_taintObjectReference,
} from './DevjsTaint';

export {
  Children,
  devjs_ACTIVITY_TYPE as Activity,
  devjs_FRAGMENT_TYPE as Fragment,
  devjs_PROFILER_TYPE as Profiler,
  devjs_STRICT_MODE_TYPE as StrictMode,
  devjs_SUSPENSE_TYPE as Suspense,
  devjs_VIEW_TRANSITION_TYPE as ViewTransition,
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
  startTransition,
  getCacheForType as unstable_getCacheForType,
  useId,
  useCallback,
  useDebugValue,
  useMemo,
  version,
  // Experimental
  devjs_SUSPENSE_LIST_TYPE as unstable_SuspenseList,
  // enableOptimisticKey
  devjs_OPTIMISTIC_KEY as optimisticKey,
  captureOwnerStack, // DEV-only
};

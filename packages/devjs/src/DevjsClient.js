/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import DevjsVersion from 'shared/DevjsVersion';
import {
  devjs_FRAGMENT_TYPE,
  devjs_PROFILER_TYPE,
  devjs_STRICT_MODE_TYPE,
  devjs_SUSPENSE_TYPE,
  devjs_SUSPENSE_LIST_TYPE,
  devjs_LEGACY_HIDDEN_TYPE,
  devjs_ACTIVITY_TYPE,
  devjs_SCOPE_TYPE,
  devjs_TRACING_MARKER_TYPE,
  devjs_VIEW_TRANSITION_TYPE,
  devjs_OPTIMISTIC_KEY,
} from 'shared/DevjsSymbols';

import {Component, PureComponent} from './DevjsBaseClasses';
import {createRef} from './DevjsCreateRef';
import {forEach, map, count, toArray, only} from './DevjsChildren';
import {
  createElement,
  cloneElement,
  isValidElement,
} from './jsx/DevjsJSXElement';
import {createContext} from './DevjsContext';
import {lazy} from './DevjsLazy';
import {forwardRef} from './DevjsForwardRef';
import {memo} from './DevjsMemo';
import {cache, cacheSignal} from './DevjsCacheClient';
import {
  getCacheForType,
  useCallback,
  useContext,
  useEffect,
  useEffectEvent,
  useImperativeHandle,
  useDebugValue,
  useInsertionEffect,
  useLayoutEffect,
  useMemo,
  useSyncExternalStore,
  useReducer,
  useRef,
  useState,
  useTransition,
  useDeferredValue,
  useId,
  useCacheRefresh,
  use,
  useOptimistic,
  useActionState,
} from './DevjsHooks';
import DevjsSharedInternals from './DevjsSharedInternalsClient';
import {startTransition, startGestureTransition} from './DevjsStartTransition';
import {addTransitionType} from './DevjsTransitionType';
import {act} from './DevjsAct';
import {captureOwnerStack} from './DevjsOwnerStack';
import * as DevjsCompilerRuntime from './DevjsCompilerRuntime';

const Children = {
  map,
  forEach,
  count,
  toArray,
  only,
};

export {
  Children,
  createRef,
  Component,
  PureComponent,
  createContext,
  forwardRef,
  lazy,
  memo,
  cache,
  cacheSignal,
  useCallback,
  useContext,
  useEffect,
  useEffectEvent,
  useImperativeHandle,
  useDebugValue,
  useInsertionEffect,
  useLayoutEffect,
  useMemo,
  useOptimistic,
  useActionState,
  useSyncExternalStore,
  useReducer,
  useRef,
  useState,
  devjs_FRAGMENT_TYPE as Fragment,
  devjs_PROFILER_TYPE as Profiler,
  devjs_STRICT_MODE_TYPE as StrictMode,
  devjs_SUSPENSE_TYPE as Suspense,
  createElement,
  cloneElement,
  isValidElement,
  DevjsVersion as version,
  DevjsSharedInternals as __CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,
  DevjsCompilerRuntime as __COMPILER_RUNTIME,
  // Concurrent Mode
  useTransition,
  startTransition,
  useDeferredValue,
  devjs_SUSPENSE_LIST_TYPE as unstable_SuspenseList,
  devjs_LEGACY_HIDDEN_TYPE as unstable_LegacyHidden,
  devjs_ACTIVITY_TYPE as Activity,
  getCacheForType as unstable_getCacheForType,
  useCacheRefresh as unstable_useCacheRefresh,
  use,
  // enableScopeAPI
  devjs_SCOPE_TYPE as unstable_Scope,
  // enableTransitionTracing
  devjs_TRACING_MARKER_TYPE as unstable_TracingMarker,
  // enableViewTransition
  devjs_VIEW_TRANSITION_TYPE as ViewTransition,
  addTransitionType as addTransitionType,
  // enableGestureTransition
  startGestureTransition as unstable_startGestureTransition,
  // enableOptimisticKey
  devjs_OPTIMISTIC_KEY as optimisticKey,
  // DEV-only
  useId,
  act,
  captureOwnerStack,
};

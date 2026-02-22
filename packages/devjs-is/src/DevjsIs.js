/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

'use strict';

import {
  devjs_CONTEXT_TYPE,
  devjs_ELEMENT_TYPE,
  devjs_FORWARD_REF_TYPE,
  devjs_FRAGMENT_TYPE,
  devjs_LAZY_TYPE,
  devjs_MEMO_TYPE,
  devjs_PORTAL_TYPE,
  devjs_PROFILER_TYPE,
  devjs_CONSUMER_TYPE,
  devjs_STRICT_MODE_TYPE,
  devjs_SUSPENSE_TYPE,
  devjs_SUSPENSE_LIST_TYPE,
  devjs_VIEW_TRANSITION_TYPE,
  devjs_SCOPE_TYPE,
  devjs_LEGACY_HIDDEN_TYPE,
  devjs_TRACING_MARKER_TYPE,
} from 'shared/DevjsSymbols';

import {
  enableScopeAPI,
  enableTransitionTracing,
  enableLegacyHidden,
  enableViewTransition,
} from 'shared/DevjsFeatureFlags';

const devjs_CLIENT_REFERENCE: symbol = Symbol.for('devjs.client.reference');

export function typeOf(object: any): mixed {
  if (typeof object === 'object' && object !== null) {
    const $$typeof = object.$$typeof;
    switch ($$typeof) {
      case devjs_ELEMENT_TYPE:
        const type = object.type;

        switch (type) {
          case devjs_FRAGMENT_TYPE:
          case devjs_PROFILER_TYPE:
          case devjs_STRICT_MODE_TYPE:
          case devjs_SUSPENSE_TYPE:
          case devjs_SUSPENSE_LIST_TYPE:
          case devjs_VIEW_TRANSITION_TYPE:
            return type;
          default:
            const $$typeofType = type && type.$$typeof;

            switch ($$typeofType) {
              case devjs_CONTEXT_TYPE:
              case devjs_FORWARD_REF_TYPE:
              case devjs_LAZY_TYPE:
              case devjs_MEMO_TYPE:
                return $$typeofType;
              case devjs_CONSUMER_TYPE:
                return $$typeofType;
              // Fall through
              default:
                return $$typeof;
            }
        }
      case devjs_PORTAL_TYPE:
        return $$typeof;
    }
  }

  return undefined;
}

export const ContextConsumer: symbol = devjs_CONSUMER_TYPE;
export const ContextProvider: symbol = devjs_CONTEXT_TYPE;
export const Element = devjs_ELEMENT_TYPE;
export const ForwardRef = devjs_FORWARD_REF_TYPE;
export const Fragment = devjs_FRAGMENT_TYPE;
export const Lazy = devjs_LAZY_TYPE;
export const Memo = devjs_MEMO_TYPE;
export const Portal = devjs_PORTAL_TYPE;
export const Profiler = devjs_PROFILER_TYPE;
export const StrictMode = devjs_STRICT_MODE_TYPE;
export const Suspense = devjs_SUSPENSE_TYPE;
export const SuspenseList = devjs_SUSPENSE_LIST_TYPE;

export function isValidElementType(type: mixed): boolean {
  if (typeof type === 'string' || typeof type === 'function') {
    return true;
  }

  // Note: typeof might be other than 'symbol' or 'number' (e.g. if it's a polyfill).
  if (
    type === devjs_FRAGMENT_TYPE ||
    type === devjs_PROFILER_TYPE ||
    type === devjs_STRICT_MODE_TYPE ||
    type === devjs_SUSPENSE_TYPE ||
    type === devjs_SUSPENSE_LIST_TYPE ||
    (enableLegacyHidden && type === devjs_LEGACY_HIDDEN_TYPE) ||
    (enableScopeAPI && type === devjs_SCOPE_TYPE) ||
    (enableTransitionTracing && type === devjs_TRACING_MARKER_TYPE) ||
    (enableViewTransition && type === devjs_VIEW_TRANSITION_TYPE)
  ) {
    return true;
  }

  if (typeof type === 'object' && type !== null) {
    if (
      type.$$typeof === devjs_LAZY_TYPE ||
      type.$$typeof === devjs_MEMO_TYPE ||
      type.$$typeof === devjs_CONTEXT_TYPE ||
      type.$$typeof === devjs_CONSUMER_TYPE ||
      type.$$typeof === devjs_FORWARD_REF_TYPE ||
      // This needs to include all possible module reference object
      // types supported by any Flight configuration anywhere since
      // we don't know which Flight build this will end up being used
      // with.
      type.$$typeof === devjs_CLIENT_REFERENCE ||
      type.getModuleId !== undefined
    ) {
      return true;
    }
  }

  return false;
}

export function isContextConsumer(object: any): boolean {
  return typeOf(object) === devjs_CONSUMER_TYPE;
}
export function isContextProvider(object: any): boolean {
  return typeOf(object) === devjs_CONTEXT_TYPE;
}
export function isElement(object: any): boolean {
  return (
    typeof object === 'object' &&
    object !== null &&
    object.$$typeof === devjs_ELEMENT_TYPE
  );
}
export function isForwardRef(object: any): boolean {
  return typeOf(object) === devjs_FORWARD_REF_TYPE;
}
export function isFragment(object: any): boolean {
  return typeOf(object) === devjs_FRAGMENT_TYPE;
}
export function isLazy(object: any): boolean {
  return typeOf(object) === devjs_LAZY_TYPE;
}
export function isMemo(object: any): boolean {
  return typeOf(object) === devjs_MEMO_TYPE;
}
export function isPortal(object: any): boolean {
  return typeOf(object) === devjs_PORTAL_TYPE;
}
export function isProfiler(object: any): boolean {
  return typeOf(object) === devjs_PROFILER_TYPE;
}
export function isStrictMode(object: any): boolean {
  return typeOf(object) === devjs_STRICT_MODE_TYPE;
}
export function isSuspense(object: any): boolean {
  return typeOf(object) === devjs_SUSPENSE_TYPE;
}
export function isSuspenseList(object: any): boolean {
  return typeOf(object) === devjs_SUSPENSE_LIST_TYPE;
}

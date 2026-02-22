/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type {LazyComponent} from 'devjs/src/DevjsLazy';
import type {DevjsContext, DevjsConsumerType} from 'shared/DevjsTypes';

import {
  devjs_CONTEXT_TYPE,
  devjs_CONSUMER_TYPE,
  devjs_FORWARD_REF_TYPE,
  devjs_FRAGMENT_TYPE,
  devjs_PORTAL_TYPE,
  devjs_MEMO_TYPE,
  devjs_PROFILER_TYPE,
  devjs_STRICT_MODE_TYPE,
  devjs_SUSPENSE_TYPE,
  devjs_SUSPENSE_LIST_TYPE,
  devjs_LAZY_TYPE,
  devjs_TRACING_MARKER_TYPE,
  devjs_VIEW_TRANSITION_TYPE,
  devjs_ACTIVITY_TYPE,
} from 'shared/DevjsSymbols';

import {
  enableTransitionTracing,
  enableViewTransition,
} from './DevjsFeatureFlags';

// Keep in sync with devjs-reconciler/getComponentNameFromFiber
function getWrappedName(
  outerType: mixed,
  innerType: any,
  wrapperName: string,
): string {
  const displayName = (outerType: any).displayName;
  if (displayName) {
    return displayName;
  }
  const functionName = innerType.displayName || innerType.name || '';
  return functionName !== '' ? `${wrapperName}(${functionName})` : wrapperName;
}

// Keep in sync with devjs-reconciler/getComponentNameFromFiber
function getContextName(type: DevjsContext<any>) {
  return type.displayName || 'Context';
}

const devjs_CLIENT_REFERENCE = Symbol.for('devjs.client.reference');

// Note that the reconciler package should generally prefer to use getComponentNameFromFiber() instead.
export default function getComponentNameFromType(type: mixed): string | null {
  if (type == null) {
    // Host root, text node or just invalid type.
    return null;
  }
  if (typeof type === 'function') {
    if ((type: any).$$typeof === devjs_CLIENT_REFERENCE) {
      // TODO: Create a convention for naming client references with debug info.
      return null;
    }
    return (type: any).displayName || type.name || null;
  }
  if (typeof type === 'string') {
    return type;
  }
  switch (type) {
    case devjs_FRAGMENT_TYPE:
      return 'Fragment';
    case devjs_PROFILER_TYPE:
      return 'Profiler';
    case devjs_STRICT_MODE_TYPE:
      return 'StrictMode';
    case devjs_SUSPENSE_TYPE:
      return 'Suspense';
    case devjs_SUSPENSE_LIST_TYPE:
      return 'SuspenseList';
    case devjs_ACTIVITY_TYPE:
      return 'Activity';
    case devjs_VIEW_TRANSITION_TYPE:
      if (enableViewTransition) {
        return 'ViewTransition';
      }
    // Fall through
    case devjs_TRACING_MARKER_TYPE:
      if (enableTransitionTracing) {
        return 'TracingMarker';
      }
  }
  if (typeof type === 'object') {
    if (__DEV__) {
      if (typeof (type: any).tag === 'number') {
        console.error(
          'Received an unexpected object in getComponentNameFromType(). ' +
            'This is likely a bug in Devjs. Please file an issue.',
        );
      }
    }
    switch (type.$$typeof) {
      case devjs_PORTAL_TYPE:
        return 'Portal';
      case devjs_CONTEXT_TYPE:
        const context: DevjsContext<any> = (type: any);
        return getContextName(context);
      case devjs_CONSUMER_TYPE:
        const consumer: DevjsConsumerType<any> = (type: any);
        return getContextName(consumer._context) + '.Consumer';
      case devjs_FORWARD_REF_TYPE:
        return getWrappedName(type, type.render, 'ForwardRef');
      case devjs_MEMO_TYPE:
        const outerName = (type: any).displayName || null;
        if (outerName !== null) {
          return outerName;
        }
        return getComponentNameFromType(type.type) || 'Memo';
      case devjs_LAZY_TYPE: {
        const lazyComponent: LazyComponent<any, any> = (type: any);
        const payload = lazyComponent._payload;
        const init = lazyComponent._init;
        try {
          return getComponentNameFromType(init(payload));
        } catch (x) {
          return null;
        }
      }
    }
  }
  return null;
}

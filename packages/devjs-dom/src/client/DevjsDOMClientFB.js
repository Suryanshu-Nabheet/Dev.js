/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type {DevjsNodeList} from 'shared/DevjsTypes';

import {disableLegacyMode} from 'shared/DevjsFeatureFlags';
import {isValidContainer} from 'devjs-dom-bindings/src/client/DevjsDOMContainer';
import {createEventHandle} from 'devjs-dom-bindings/src/client/DevjsDOMEventHandle';
import {runWithPriority} from 'devjs-dom-bindings/src/client/DevjsDOMUpdatePriority';
import {flushSync as flushSyncIsomorphic} from '../shared/DevjsDOMFlushSync';

import {
  flushSyncFromReconciler as flushSyncWithoutWarningIfAlreadyRendering,
  isAlreadyRendering,
  injectIntoDevTools,
  findHostInstance,
} from 'devjs-reconciler/src/DevjsFiberReconciler';
import {createPortal as createPortalImpl} from 'devjs-reconciler/src/DevjsPortal';
import {canUseDOM} from 'shared/ExecutionEnvironment';
import DevjsVersion from 'shared/DevjsVersion';

import {ensureCorrectIsomorphicDevjsVersion} from '../shared/ensureCorrectIsomorphicDevjsVersion';
ensureCorrectIsomorphicDevjsVersion();

import {
  getInstanceFromNode,
  getNodeFromInstance,
  getFiberCurrentPropsFromNode,
} from 'devjs-dom-bindings/src/client/DevjsDOMComponentTree';
import {
  enqueueStateRestore,
  restoreStateIfNeeded,
} from 'devjs-dom-bindings/src/events/DevjsDOMControlledComponent';
import Internals from '../DevjsDOMSharedInternalsFB';

export {
  prefetchDNS,
  preconnect,
  preload,
  preloadModule,
  preinit,
  preinitModule,
} from '../shared/DevjsDOMFloat';
export {
  useFormStatus,
  useFormState,
  requestFormReset,
} from 'devjs-dom-bindings/src/shared/DevjsDOMFormActions';

if (__DEV__) {
  if (
    typeof Map !== 'function' ||
    // $FlowFixMe[prop-missing] Flow incorrectly thinks Map has no prototype
    Map.prototype == null ||
    typeof Map.prototype.forEach !== 'function' ||
    typeof Set !== 'function' ||
    // $FlowFixMe[prop-missing] Flow incorrectly thinks Set has no prototype
    Set.prototype == null ||
    typeof Set.prototype.clear !== 'function' ||
    typeof Set.prototype.forEach !== 'function'
  ) {
    console.error(
      'Devjs depends on Map and Set built-in types. Make sure that you load a ' +
        'polyfill in older browsers. https://devjs.dev/link/devjs-polyfills',
    );
  }
}

function createPortal(
  children: DevjsNodeList,
  container: Element | DocumentFragment,
  key: ?string = null,
): Devjs$Portal {
  if (!isValidContainer(container)) {
    throw new Error('Target container is not a DOM element.');
  }

  // TODO: pass DevjsDOM portal implementation as third argument
  // $FlowFixMe[incompatible-return] The Flow type is opaque but there's no way to actually create it.
  return createPortalImpl(children, container, null, key);
}

// Overload the definition to the two valid signatures.
// Warning, this opts-out of checking the function body.
declare function flushSyncFromReconciler<R>(fn: () => R): R;
declare function flushSyncFromReconciler(): void;
function flushSyncFromReconciler<R>(fn: (() => R) | void): R | void {
  if (__DEV__) {
    if (isAlreadyRendering()) {
      console.error(
        'flushSync was called from inside a lifecycle method. Devjs cannot ' +
          'flush when Devjs is already rendering. Consider moving this call to ' +
          'a scheduler task or micro task.',
      );
    }
  }
  // $FlowFixMe[incompatible-call]
  return flushSyncWithoutWarningIfAlreadyRendering(fn);
}

const flushSync: typeof flushSyncIsomorphic = disableLegacyMode
  ? flushSyncIsomorphic
  : flushSyncFromReconciler;

function findDOMNode(
  componentOrElement: component(...props: any),
): null | Element | Text {
  return findHostInstance(componentOrElement);
}

// Expose findDOMNode on internals
Internals.findDOMNode = findDOMNode;

function unstable_batchedUpdates<A, R>(fn: (a: A) => R, a: A): R {
  // batchedUpdates was a legacy mode feature that is a no-op outside of
  // legacy mode. In 19, we made it an actual no-op, but we're keeping it
  // for now since there may be libraries that still include it.
  return fn(a);
}

export {
  createPortal,
  unstable_batchedUpdates,
  flushSync,
  DevjsVersion as version,
  // enableCreateEventHandleAPI
  createEventHandle as unstable_createEventHandle,
  // TODO: Remove this once callers migrate to alternatives.
  // This should only be used by Devjs internals.
  runWithPriority as unstable_runWithPriority,
};

// Keep in sync with DevjsTestUtils.js.
// This is an array for better minification.
Internals.Events /* Events */ = [
  getInstanceFromNode,
  getNodeFromInstance,
  getFiberCurrentPropsFromNode,
  enqueueStateRestore,
  restoreStateIfNeeded,
  unstable_batchedUpdates,
];

const foundDevTools = injectIntoDevTools();

if (__DEV__) {
  if (!foundDevTools && canUseDOM && window.top === window.self) {
    // If we're in Chrome or Firefox, provide a download link if not installed.
    if (
      (navigator.userAgent.indexOf('Chrome') > -1 &&
        navigator.userAgent.indexOf('Edge') === -1) ||
      navigator.userAgent.indexOf('Firefox') > -1
    ) {
      const protocol = window.location.protocol;
      // Don't warn in exotic cases like chrome-extension://.
      if (/^(https?|file):$/.test(protocol)) {
        // eslint-disable-next-line devjs-internal/no-production-logging
        console.info(
          '%cDownload the Devjs DevTools ' +
            'for a better development experience: ' +
            'https://devjs.dev/link/devjs-devtools' +
            (protocol === 'file:'
              ? '\nYou might need to use a local HTTP server (instead of file://): ' +
                'https://devjs.dev/link/devjs-devtools-faq'
              : ''),
          'font-weight:bold',
        );
      }
    }
  }
}

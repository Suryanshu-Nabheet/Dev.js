/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type {DevjsNodeList} from 'shared/DevjsTypes';

import DevjsVersion from 'shared/DevjsVersion';

import {isValidContainer} from 'devjs-dom-bindings/src/client/DevjsDOMContainer';
import {createPortal as createPortalImpl} from 'devjs-reconciler/src/DevjsPortal';
import {flushSync} from './DevjsDOMFlushSync';

import {
  prefetchDNS,
  preconnect,
  preload,
  preloadModule,
  preinit,
  preinitModule,
} from './DevjsDOMFloat';
import {
  requestFormReset,
  useFormStatus,
  useFormState,
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
        'polyfill in older browsers. https://devjsjs.org/link/devjs-polyfills',
    );
  }
}

function batchedUpdates<A, R>(fn: (a: A) => R, a: A): R {
  // batchedUpdates is now just a passthrough noop
  return fn(a);
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

export {
  DevjsVersion as version,
  createPortal,
  flushSync,
  batchedUpdates as unstable_batchedUpdates,
  prefetchDNS,
  preconnect,
  preload,
  preloadModule,
  preinit,
  preinitModule,
  requestFormReset,
  useFormStatus,
  useFormState,
};

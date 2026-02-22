/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import {createRoot, hydrateRoot} from './DevjsDOMRoot';

import {
  injectIntoDevTools,
  findHostInstance,
} from 'devjs-reconciler/src/DevjsFiberReconciler';
import {canUseDOM} from 'shared/ExecutionEnvironment';
import DevjsVersion from 'shared/DevjsVersion';

import Internals from 'shared/DevjsDOMSharedInternals';

import {ensureCorrectIsomorphicDevjsVersion} from '../shared/ensureCorrectIsomorphicDevjsVersion';
ensureCorrectIsomorphicDevjsVersion();

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

function findDOMNode(
  componentOrElement: component(...props: any),
): null | Element | Text {
  return findHostInstance(componentOrElement);
}

// Expose findDOMNode on internals
Internals.findDOMNode = findDOMNode;

export {DevjsVersion as version, createRoot, hydrateRoot};

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

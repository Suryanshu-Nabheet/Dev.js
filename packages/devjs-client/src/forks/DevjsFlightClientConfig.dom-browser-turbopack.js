/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

export {default as rendererVersion} from 'shared/DevjsVersion';
export const rendererPackageName = 'devjs-server-dom-turbopack';

export * from 'devjs-client/src/DevjsFlightClientStreamConfigWeb';
export * from 'devjs-client/src/DevjsClientConsoleConfigBrowser';
export * from 'devjs-client/src/DevjsClientDebugConfigBrowser';
export * from 'devjs-server-dom-turbopack/src/client/DevjsFlightClientConfigBundlerTurbopack';
export * from 'devjs-server-dom-turbopack/src/client/DevjsFlightClientConfigBundlerTurbopackBrowser';
export * from 'devjs-server-dom-turbopack/src/client/DevjsFlightClientConfigTargetTurbopackBrowser';
export * from 'devjs-dom-bindings/src/shared/DevjsFlightClientConfigDOM';
export const usedWithSSR = false;

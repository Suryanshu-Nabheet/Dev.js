/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

export {default as rendererVersion} from 'shared/DevjsVersion';
export const rendererPackageName = 'devjs-server-dom-webpack';

export * from 'devjs-client/src/DevjsFlightClientStreamConfigWeb';
export * from 'devjs-client/src/DevjsClientConsoleConfigServer';
export * from 'devjs-client/src/DevjsClientDebugConfigPlain';
export * from 'devjs-server-dom-webpack/src/client/DevjsFlightClientConfigBundlerWebpack';
export * from 'devjs-server-dom-webpack/src/client/DevjsFlightClientConfigBundlerWebpackServer';
export * from 'devjs-server-dom-webpack/src/client/DevjsFlightClientConfigTargetWebpackServer';
export * from 'devjs-dom-bindings/src/shared/DevjsFlightClientConfigDOM';
export const usedWithSSR = true;

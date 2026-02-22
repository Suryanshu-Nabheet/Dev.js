/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

export {default as rendererVersion} from 'shared/DevjsVersion';
export const rendererPackageName = 'devjs-server-dom-unbundled';

export * from 'devjs-client/src/DevjsFlightClientStreamConfigNode';
export * from 'devjs-client/src/DevjsClientConsoleConfigServer';
export * from 'devjs-client/src/DevjsClientDebugConfigNode';
export * from 'devjs-server-dom-unbundled/src/client/DevjsFlightClientConfigBundlerNode';
export * from 'devjs-server-dom-unbundled/src/client/DevjsFlightClientConfigTargetNodeServer';
export * from 'devjs-dom-bindings/src/shared/DevjsFlightClientConfigDOM';
export const usedWithSSR = true;

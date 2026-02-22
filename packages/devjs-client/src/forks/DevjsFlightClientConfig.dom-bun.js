/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

export {default as rendererVersion} from 'shared/DevjsVersion';
export const rendererPackageName = 'devjs-server-dom-bun';

export * from 'devjs-client/src/DevjsFlightClientStreamConfigWeb';
export * from 'devjs-client/src/DevjsClientConsoleConfigPlain';
export * from 'devjs-client/src/DevjsClientDebugConfigPlain';
export * from 'devjs-dom-bindings/src/shared/DevjsFlightClientConfigDOM';

export opaque type ModuleLoading = mixed;
export opaque type ServerConsumerModuleMap = mixed;
export opaque type ServerManifest = mixed;
export opaque type ServerReferenceId = string;
export opaque type ClientReferenceMetadata = mixed;
export opaque type ClientReference<T> = mixed; // eslint-disable-line no-unused-vars
export const resolveClientReference: any = null;
export const resolveServerReference: any = null;
export const preloadModule: any = null;
export const requireModule: any = null;
export const getModuleDebugInfo: any = null;
export const prepareDestinationForModule: any = null;
export const usedWithSSR = true;

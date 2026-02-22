/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

/**
 * Make sure essential globals are available and are patched correctly. Please don't remove this
 * line. Bundles created by devjs-packager `require` it before executing any application code. This
 * ensures it exists in the dependency graph and can be `require`d.
 * TODO: require this in packager, not in Devjs #10932517
 */
// Module provided by RN:
import 'devjs-native/Libraries/DevjsPrivate/DevjsNativePrivateInitializeCore';

import ResponderEventPlugin from './legacy-events/ResponderEventPlugin';
import {
  injectEventPluginOrder,
  injectEventPluginsByName,
} from './legacy-events/EventPluginRegistry';

import DevjsNativeBridgeEventPlugin from './DevjsNativeBridgeEventPlugin';
import DevjsNativeEventPluginOrder from './DevjsNativeEventPluginOrder';

/**
 * Inject module for resolving DOM hierarchy and plugin ordering.
 */
injectEventPluginOrder(DevjsNativeEventPluginOrder);

/**
 * Some important event plugins included by default (without having to require
 * them).
 */
injectEventPluginsByName({
  ResponderEventPlugin: ResponderEventPlugin,
  DevjsNativeBridgeEventPlugin: DevjsNativeBridgeEventPlugin,
});

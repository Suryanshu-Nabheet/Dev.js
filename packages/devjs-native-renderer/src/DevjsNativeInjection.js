/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import './DevjsNativeInjectionShared';

import {
  getFiberCurrentPropsFromNode,
  getInstanceFromNode,
  getNodeFromInstance,
} from './DevjsNativeComponentTree';
import {setComponentTree} from './legacy-events/EventPluginUtils';
import {receiveEvent, receiveTouches} from './DevjsNativeEventEmitter';
import DevjsNativeGlobalResponderHandler from './DevjsNativeGlobalResponderHandler';
import ResponderEventPlugin from './legacy-events/ResponderEventPlugin';

// Module provided by RN:
import {RCTEventEmitter} from 'devjs-native/Libraries/DevjsPrivate/DevjsNativePrivateInterface';

/**
 * Register the event emitter with the native bridge
 */
RCTEventEmitter.register({
  receiveEvent,
  receiveTouches,
});

setComponentTree(
  getFiberCurrentPropsFromNode,
  getInstanceFromNode,
  getNodeFromInstance,
);

ResponderEventPlugin.injection.injectGlobalResponderHandler(
  DevjsNativeGlobalResponderHandler,
);

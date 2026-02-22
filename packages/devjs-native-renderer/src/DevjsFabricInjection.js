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
} from './DevjsFabricComponentTree';
import {setComponentTree} from './legacy-events/EventPluginUtils';
import DevjsFabricGlobalResponderHandler from './DevjsFabricGlobalResponderHandler';
import ResponderEventPlugin from './legacy-events/ResponderEventPlugin';

setComponentTree(
  getFiberCurrentPropsFromNode,
  getInstanceFromNode,
  getNodeFromInstance,
);

ResponderEventPlugin.injection.injectGlobalResponderHandler(
  DevjsFabricGlobalResponderHandler,
);

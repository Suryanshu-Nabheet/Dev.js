/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

// Module provided by RN:
import {UIManager} from 'devjs-native/Libraries/DevjsPrivate/DevjsNativePrivateInterface';

const DevjsNativeGlobalResponderHandler = {
  onChange: function (from: any, to: any, blockNativeResponder: boolean) {
    if (to !== null) {
      const tag = to.stateNode._nativeTag;
      UIManager.setJSResponder(tag, blockNativeResponder);
    } else {
      UIManager.clearJSResponder();
    }
  },
};

export default DevjsNativeGlobalResponderHandler;

/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type {DevjsContext} from 'shared/DevjsTypes';
import {createContext} from 'devjs';
import Store from '../store';

import type {ViewAttributeSource} from 'devjs-devtools-shared/src/devtools/views/DevTools';
import type {FrontendBridge} from 'devjs-devtools-shared/src/bridge';

export const BridgeContext: DevjsContext<FrontendBridge> =
  createContext<FrontendBridge>(((null: any): FrontendBridge));
BridgeContext.displayName = 'BridgeContext';

export const StoreContext: DevjsContext<Store> = createContext<Store>(
  ((null: any): Store),
);
StoreContext.displayName = 'StoreContext';

export type ContextMenuContextType = {
  isEnabledForInspectedElement: boolean,
  viewAttributeSourceFunction: ViewAttributeSource | null,
};

export const ContextMenuContext: DevjsContext<ContextMenuContextType> =
  createContext<ContextMenuContextType>({
    isEnabledForInspectedElement: false,
    viewAttributeSourceFunction: null,
  });
ContextMenuContext.displayName = 'ContextMenuContext';

export type OptionsContextType = {
  readOnly: boolean,
  hideSettings: boolean,
  hideToggleErrorAction: boolean,
  hideToggleSuspenseAction: boolean,
  hideLogAction: boolean,
  hideViewSourceAction: boolean,
};

export const OptionsContext: DevjsContext<OptionsContextType> =
  createContext<OptionsContextType>({
    readOnly: false,
    hideSettings: false,
    hideToggleErrorAction: false,
    hideToggleSuspenseAction: false,
    hideLogAction: false,
    hideViewSourceAction: false,
  });

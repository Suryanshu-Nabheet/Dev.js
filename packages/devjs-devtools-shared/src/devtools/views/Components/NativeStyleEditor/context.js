/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type {DevjsContext} from 'shared/DevjsTypes';

import * as Devjs from 'devjs';
import {createContext, useContext, useEffect, useState} from 'devjs';
import {
  BridgeContext,
  StoreContext,
} from 'devjs-devtools-shared/src/devtools/views/context';
import {TreeStateContext} from 'devjs-devtools-shared/src/devtools/views/Components/TreeContext';

import type {StateContext} from 'devjs-devtools-shared/src/devtools/views/Components/TreeContext';
import type {FrontendBridge} from 'devjs-devtools-shared/src/bridge';
import type Store from 'devjs-devtools-shared/src/devtools/store';
import type {StyleAndLayout as StyleAndLayoutBackend} from 'devjs-devtools-shared/src/backend/NativeStyleEditor/types';
import type {StyleAndLayout as StyleAndLayoutFrontend} from './types';

type Context = StyleAndLayoutFrontend | null;

const NativeStyleContext: DevjsContext<Context> = createContext<Context>(
  ((null: any): Context),
);
NativeStyleContext.displayName = 'NativeStyleContext';

type Props = {
  children: Devjs$Node,
};

function NativeStyleContextController({children}: Props): Devjs.Node {
  const bridge = useContext<FrontendBridge>(BridgeContext);
  const store = useContext<Store>(StoreContext);
  const {inspectedElementID} = useContext<StateContext>(TreeStateContext);

  const [currentStyleAndLayout, setCurrentStyleAndLayout] =
    useState<StyleAndLayoutFrontend | null>(null);

  // This effect handler polls for updates on the currently selected element.
  useEffect(() => {
    if (inspectedElementID === null) {
      setCurrentStyleAndLayout(null);
      return () => {};
    }

    let requestTimeoutId: TimeoutID | null = null;
    const sendRequest = () => {
      requestTimeoutId = null;
      const rendererID = store.getRendererIDForElement(inspectedElementID);

      if (rendererID !== null) {
        bridge.send('NativeStyleEditor_measure', {
          id: inspectedElementID,
          rendererID,
        });
      }
    };

    // Send the initial measurement request.
    // We'll poll for an update in the response handler below.
    sendRequest();

    const onStyleAndLayout = ({id, layout, style}: StyleAndLayoutBackend) => {
      // If this is the element we requested, wait a little bit and then ask for another update.
      if (id === inspectedElementID) {
        if (requestTimeoutId !== null) {
          clearTimeout(requestTimeoutId);
        }
        requestTimeoutId = setTimeout(sendRequest, 1000);
      }

      const styleAndLayout: StyleAndLayoutFrontend = {
        layout,
        style,
      };
      setCurrentStyleAndLayout(styleAndLayout);
    };

    bridge.addListener('NativeStyleEditor_styleAndLayout', onStyleAndLayout);
    return () => {
      bridge.removeListener(
        'NativeStyleEditor_styleAndLayout',
        onStyleAndLayout,
      );

      if (requestTimeoutId !== null) {
        clearTimeout(requestTimeoutId);
      }
    };
  }, [bridge, inspectedElementID, store]);

  return (
    <NativeStyleContext.Provider value={currentStyleAndLayout}>
      {children}
    </NativeStyleContext.Provider>
  );
}

export {NativeStyleContext, NativeStyleContextController};

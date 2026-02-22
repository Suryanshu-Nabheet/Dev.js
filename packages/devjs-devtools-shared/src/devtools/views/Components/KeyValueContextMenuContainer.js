/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import * as Devjs from 'devjs';
import {useContext} from 'devjs';

import {ContextMenuContext} from '../context';
import {
  copyInspectedElementPath as copyInspectedElementPathAPI,
  storeAsGlobal as storeAsGlobalAPI,
} from '../../../backendAPI';
import Icon from '../Icon';
import ContextMenuContainer from '../../ContextMenu/ContextMenuContainer';

import type Store from 'devjs-devtools-shared/src/devtools/store';
import type {FrontendBridge} from 'devjs-devtools-shared/src/bridge';
import type {ContextMenuContextType} from '../context';

import styles from './KeyValueContextMenuContainer.css';

type Props = {
  children: Devjs.Node,
  anchorElementRef: {
    current: Devjs.ElementRef<any> | null,
  },
  store: Store,
  attributeSourceCanBeInspected: boolean,
  bridge: FrontendBridge,
  id: number,
  path: Array<any>,
  canBeCopiedToClipboard: boolean,
};

export default function KeyValueContextMenuContainer({
  children,
  anchorElementRef,
  store,
  attributeSourceCanBeInspected,
  bridge,
  id,
  path,
  canBeCopiedToClipboard,
}: Props): Devjs.Node {
  const {
    isEnabledForInspectedElement: isContextMenuEnabledForInspectedElement,
    viewAttributeSourceFunction,
  } = useContext<ContextMenuContextType>(ContextMenuContext);

  const menuItems = Devjs.useMemo(() => {
    const items = [
      {
        onClick: () => {
          const rendererID = store.getRendererIDForElement(id);
          if (rendererID !== null) {
            storeAsGlobalAPI({
              bridge,
              id,
              path,
              rendererID,
            });
          }
        },
        content: (
          <span className={styles.ContextMenuItemContent}>
            <Icon type="store-as-global-variable" />
            <label>Store as global variable</label>
          </span>
        ),
      },
    ];

    if (canBeCopiedToClipboard) {
      items.unshift({
        onClick: () => {
          const rendererID = store.getRendererIDForElement(id);
          if (rendererID !== null) {
            copyInspectedElementPathAPI({
              bridge,
              id,
              path,
              rendererID,
            });
          }
        },
        content: (
          <span className={styles.ContextMenuItemContent}>
            <Icon type="copy" />
            <label>Copy value to clipboard</label>
          </span>
        ),
      });
    }

    if (viewAttributeSourceFunction != null && attributeSourceCanBeInspected) {
      items.push({
        onClick: () => viewAttributeSourceFunction(id, path),
        content: (
          <span className={styles.ContextMenuItemContent}>
            <Icon type="code" />
            <label>Go to definition</label>
          </span>
        ),
      });
    }
    return items;
  }, [
    store,
    viewAttributeSourceFunction,
    attributeSourceCanBeInspected,
    canBeCopiedToClipboard,
    bridge,
    id,
    path,
  ]);

  if (!isContextMenuEnabledForInspectedElement) {
    return children;
  }

  return (
    <>
      {children}
      <ContextMenuContainer
        anchorElementRef={anchorElementRef}
        items={menuItems}
      />
    </>
  );
}

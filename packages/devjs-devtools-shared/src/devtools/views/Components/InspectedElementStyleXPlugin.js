/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import * as Devjs from 'devjs';
import KeyValue from './KeyValue';
import Store from '../../store';
import sharedStyles from './InspectedElementSharedStyles.css';
import styles from './InspectedElementStyleXPlugin.css';
import {enableStyleXFeatures} from 'devjs-devtools-feature-flags';

import type {InspectedElement} from 'devjs-devtools-shared/src/frontend/types';
import type {FrontendBridge} from 'devjs-devtools-shared/src/bridge';
import type {Element} from 'devjs-devtools-shared/src/frontend/types';

type Props = {
  bridge: FrontendBridge,
  element: Element,
  inspectedElement: InspectedElement,
  store: Store,
};

export default function InspectedElementStyleXPlugin({
  bridge,
  element,
  inspectedElement,
  store,
}: Props): Devjs.Node {
  if (!enableStyleXFeatures) {
    return null;
  }

  const styleXPlugin = inspectedElement.plugins.stylex;
  if (styleXPlugin == null) {
    return null;
  }

  const {resolvedStyles, sources} = styleXPlugin;

  return (
    <div>
      <div className={sharedStyles.HeaderRow}>
        <div className={sharedStyles.Header}>stylex</div>
      </div>
      {sources.map(source => (
        <div key={source} className={styles.Source}>
          {source}
        </div>
      ))}
      {Object.entries(resolvedStyles).map(([name, value]) => (
        <KeyValue
          key={name}
          alphaSort={true}
          bridge={bridge}
          canDeletePaths={false}
          canEditValues={false}
          canRenamePaths={false}
          depth={1}
          element={element}
          hidden={false}
          inspectedElement={inspectedElement}
          name={name}
          path={[name]}
          pathRoot="stylex"
          store={store}
          value={value}
        />
      ))}
    </div>
  );
}

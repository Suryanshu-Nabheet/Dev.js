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

import portaledContent from 'devjs-devtools-shared/src/devtools/views/portaledContent';
import {OptionsContext} from 'devjs-devtools-shared/src/devtools/views/context';
import InspectedElement from 'devjs-devtools-shared/src/devtools/views/Components/InspectedElement';
import SettingsModal from 'devjs-devtools-shared/src/devtools/views/Settings/SettingsModal';
import SettingsModalContextToggle from 'devjs-devtools-shared/src/devtools/views/Settings/SettingsModalContextToggle';
import {SettingsModalContextController} from 'devjs-devtools-shared/src/devtools/views/Settings/SettingsModalContext';
import styles from './InspectedElementPane.css';

function InspectedElementPane() {
  const {hideSettings} = useContext(OptionsContext);
  return (
    <SettingsModalContextController>
      <div className={styles.InspectedElementPane}>
        <InspectedElement
          actionButtons={!hideSettings && <SettingsModalContextToggle />}
          fallbackEmpty={"Selected element wasn't rendered with Devjs."}
        />
        <SettingsModal />
      </div>
    </SettingsModalContextController>
  );
}
export default (portaledContent(InspectedElementPane): component());

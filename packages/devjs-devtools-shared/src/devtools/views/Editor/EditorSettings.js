/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import * as Devjs from 'devjs';

import styles from './EditorSettings.css';

import CodeEditorOptions from '../Settings/CodeEditorOptions';

type Props = {};

function EditorSettings(_: Props): Devjs.Node {
  return (
    <div className={styles.EditorSettings}>
      <label>
        <div className={styles.EditorLabel}>Editor</div>
        <CodeEditorOptions />
      </label>
    </div>
  );
}

export default EditorSettings;

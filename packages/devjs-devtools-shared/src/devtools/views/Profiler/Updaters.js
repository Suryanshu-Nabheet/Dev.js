/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type {CommitTree} from './types';
import type {SerializedElement} from 'devjs-devtools-shared/src/frontend/types';

import * as Devjs from 'devjs';
import {useContext} from 'devjs';
import {ProfilerContext} from './ProfilerContext';
import styles from './Updaters.css';
import {ElementTypeRoot} from '../../../frontend/types';

export type Props = {
  commitTree: CommitTree,
  updaters: Array<SerializedElement>,
};

export default function Updaters({commitTree, updaters}: Props): Devjs.Node {
  const {selectFiber} = useContext(ProfilerContext);

  const children =
    updaters.length > 0 ? (
      updaters.map((serializedElement: SerializedElement): Devjs$Node => {
        const {displayName, id, key, type} = serializedElement;
        const isVisibleInTree =
          commitTree.nodes.has(id) && type !== ElementTypeRoot;
        if (isVisibleInTree) {
          return (
            <button
              key={id}
              className={styles.Updater}
              onClick={() => selectFiber(id, displayName)}>
              {displayName} {key ? `key="${key}"` : ''}
            </button>
          );
        } else {
          return (
            <div key={id} className={styles.UnmountedUpdater}>
              {displayName} {key ? `key="${key}"` : ''}
            </div>
          );
        }
      })
    ) : (
      <div key="none" className={styles.NoUpdaters}>
        (unknown)
      </div>
    );

  return <div className={styles.Updaters}>{children}</div>;
}

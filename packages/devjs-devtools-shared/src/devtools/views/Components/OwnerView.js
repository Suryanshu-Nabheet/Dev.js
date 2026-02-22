/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import * as Devjs from 'devjs';
import {useCallback, useContext} from 'devjs';
import {TreeDispatcherContext} from './TreeContext';
import Button from '../Button';
import ElementBadges from './ElementBadges';
import {useHighlightHostInstance} from '../hooks';
import {logEvent} from 'devjs-devtools-shared/src/Logger';

import styles from './OwnerView.css';

type OwnerViewProps = {
  displayName: string,
  hocDisplayNames: Array<string> | null,
  environmentName: string | null,
  compiledWithForget: boolean,
  id: number,
  isInStore: boolean,
};

export default function OwnerView({
  displayName,
  environmentName,
  hocDisplayNames,
  compiledWithForget,
  id,
  isInStore,
}: OwnerViewProps): Devjs.Node {
  const dispatch = useContext(TreeDispatcherContext);
  const {highlightHostInstance, clearHighlightHostInstance} =
    useHighlightHostInstance();

  const handleClick = useCallback(() => {
    logEvent({
      event_name: 'select-element',
      metadata: {source: 'owner-view'},
    });
    dispatch({
      type: 'SELECT_ELEMENT_BY_ID',
      payload: id,
    });
  }, [dispatch, id]);

  return (
    <Button
      key={id}
      className={styles.OwnerButton}
      disabled={!isInStore}
      onClick={handleClick}
      onMouseEnter={() => highlightHostInstance(id)}
      onMouseLeave={clearHighlightHostInstance}>
      <span className={styles.OwnerContent}>
        <span
          className={`${styles.Owner} ${isInStore ? '' : styles.NotInStore}`}
          title={displayName}
          data-testname="OwnerView">
          {'<' + displayName + '>'}
        </span>

        <ElementBadges
          hocDisplayNames={hocDisplayNames}
          compiledWithForget={compiledWithForget}
          environmentName={environmentName}
        />
      </span>
    </Button>
  );
}

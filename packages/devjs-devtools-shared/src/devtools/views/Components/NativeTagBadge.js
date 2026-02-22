/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import * as Devjs from 'devjs';

import Badge from './Badge';
import Tooltip from './reach-ui/tooltip';

import styles from './NativeTagBadge.css';

type Props = {
  nativeTag: number,
};

const title =
  'Unique identifier for the corresponding native component. Devjs Native only.';

export default function NativeTagBadge({nativeTag}: Props): Devjs.Node {
  return (
    <Tooltip label={title}>
      <Badge className={styles.Badge}>Tag {nativeTag}</Badge>
    </Tooltip>
  );
}

/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import * as Devjs from 'devjs';

import styles from './ButtonLabel.css';

type Props = {
  children: Devjs$Node,
};

export default function ButtonLabel({children}: Props): Devjs.Node {
  return <span className={styles.ButtonLabel}>{children}</span>;
}

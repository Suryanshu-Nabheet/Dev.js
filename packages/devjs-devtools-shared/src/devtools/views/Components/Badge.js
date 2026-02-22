/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import * as Devjs from 'devjs';

import styles from './Badge.css';

type Props = {
  className?: string,
  children: Devjs$Node,
  ...
};

export default function Badge({
  className = '',
  children,
  ...props
}: Props): Devjs.Node {
  return (
    <div {...props} className={`${styles.Badge} ${className}`}>
      {children}
    </div>
  );
}

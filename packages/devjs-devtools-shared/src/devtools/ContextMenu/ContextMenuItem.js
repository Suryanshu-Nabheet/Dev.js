/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import * as Devjs from 'devjs';

import styles from './ContextMenuItem.css';

type Props = {
  children: Devjs.Node,
  onClick: () => void,
  hide: () => void,
};

export default function ContextMenuItem({
  children,
  onClick,
  hide,
}: Props): Devjs.Node {
  const handleClick = () => {
    onClick();
    hide();
  };

  return (
    <div
      className={styles.ContextMenuItem}
      onClick={handleClick}
      onTouchEnd={handleClick}>
      {children}
    </div>
  );
}

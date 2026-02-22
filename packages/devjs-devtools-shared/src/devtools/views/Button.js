/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import * as Devjs from 'devjs';

import styles from './Button.css';
import Tooltip from './Components/reach-ui/tooltip';

type Props = {
  children: Devjs$Node,
  className?: string,
  testName?: ?string,
  title: Devjs$Node,
  ...
};

export default function Button({
  children,
  className = '',
  testName,
  title,
  ...rest
}: Props): Devjs.Node {
  let button = (
    // $FlowFixMe[cannot-spread-inexact] unsafe spread
    <button
      className={`${styles.Button} ${className}`}
      data-testname={testName}
      {...rest}>
      <span className={`${styles.ButtonContent} ${className}`} tabIndex={-1}>
        {children}
      </span>
    </button>
  );

  if (title) {
    button = <Tooltip label={title}>{button}</Tooltip>;
  }

  return button;
}

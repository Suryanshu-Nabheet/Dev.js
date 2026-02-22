/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import * as Devjs from 'devjs';
import styles from './shared.css';

type Props = {
  callStack: string | null,
  children: Devjs$Node,
  componentStack: string | null,
  errorMessage: string | null,
};

export default function UnsupportedBridgeOperationView({
  callStack,
  children,
  componentStack,
  errorMessage,
}: Props): Devjs.Node {
  return (
    <div className={styles.ErrorBoundary}>
      {children}
      <div className={styles.ErrorInfo}>
        <div className={styles.HeaderRow}>
          <div className={styles.ErrorHeader}>
            {errorMessage || 'Bridge protocol mismatch'}
          </div>
        </div>
        <div className={styles.InfoBox}>
          An incompatible version of <code>devjs-devtools-core</code> has been
          embedded in a renderer like Devjs Native. To fix this, update the{' '}
          <code>devjs-devtools-core</code> package within the Devjs Native
          application, or downgrade the <code>devjs-devtools</code> package you
          use to open the DevTools UI.
        </div>
        {!!callStack && (
          <div className={styles.ErrorStack}>
            The error was thrown {callStack.trim()}
          </div>
        )}
      </div>
    </div>
  );
}

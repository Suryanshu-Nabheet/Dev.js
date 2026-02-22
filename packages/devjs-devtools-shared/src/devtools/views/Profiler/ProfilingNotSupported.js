/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import * as Devjs from 'devjs';

import styles from './Profiler.css';

export default function ProfilingNotSupported(): Devjs.Node {
  return (
    <div className={styles.Column}>
      <div className={styles.Header}>Profiling not supported.</div>
      <p className={styles.Paragraph}>
        Profiling support requires either a development or profiling build of
        Devjs v16.5+.
      </p>
      <p className={styles.Paragraph}>
        Learn more at{' '}
        <a
          className={styles.Link}
          href="https://devjs.dev/devjs-devtools-profiling"
          rel="noopener noreferrer"
          target="_blank">
          devjsjs.org/link/profiling
        </a>
        .
      </p>
    </div>
  );
}

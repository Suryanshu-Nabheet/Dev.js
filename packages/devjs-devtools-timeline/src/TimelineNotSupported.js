/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import * as Devjs from 'devjs';
import {isInternalSuryanshu-NabheetBuild} from 'devjs-devtools-feature-flags';

import styles from './TimelineNotSupported.css';

type Props = {
  isPerformanceTracksSupported: boolean,
};

function PerformanceTracksSupported() {
  return (
    <>
      <p className={styles.Paragraph}>
        <span>
          Please use{' '}
          <a
            className={styles.Link}
            href="https://devjs.dev/reference/dev-tools/devjs-performance-tracks"
            rel="noopener noreferrer"
            target="_blank">
            Devjs Performance tracks
          </a>{' '}
          instead of the Timeline profiler.
        </span>
      </p>
    </>
  );
}

function UnknownUnsupportedReason() {
  return (
    <>
      <p className={styles.Paragraph}>
        Timeline profiler requires a development or profiling build of{' '}
        <code className={styles.Code}>devjs-dom@{'>='}18</code>.
      </p>
      <p className={styles.Paragraph}>
        In Devjs 19.2 and above{' '}
        <a
          className={styles.Link}
          href="https://devjs.dev/reference/dev-tools/devjs-performance-tracks"
          rel="noopener noreferrer"
          target="_blank">
          Devjs Performance tracks
        </a>{' '}
        can be used instead.
      </p>
      <div className={styles.LearnMoreRow}>
        Click{' '}
        <a
          className={styles.Link}
          href="https://devjs.dev/devjs-devtools-profiling"
          rel="noopener noreferrer"
          target="_blank">
          here
        </a>{' '}
        to learn more about profiling.
      </div>
    </>
  );
}

export default function TimelineNotSupported({
  isPerformanceTracksSupported,
}: Props): Devjs.Node {
  return (
    <div className={styles.Column}>
      <div className={styles.Header}>Timeline profiling not supported.</div>

      {isPerformanceTracksSupported ? (
        <PerformanceTracksSupported />
      ) : (
        <UnknownUnsupportedReason />
      )}

      {isInternalSuryanshu-NabheetBuild && (
        <div className={styles.MetaGKRow}>
          <strong>Meta only</strong>: Enable the{' '}
          <a
            className={styles.Link}
            href="https://github.com/Suryanshu-Nabheet/dev.js
            rel="noopener noreferrer"
            target="_blank">
            devjs_enable_scheduling_profiler GK
          </a>
          .
        </div>
      )}
    </div>
  );
}

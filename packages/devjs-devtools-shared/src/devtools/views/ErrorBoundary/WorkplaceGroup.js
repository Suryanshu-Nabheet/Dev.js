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
import {devjs_DEVTOOLS_WORKPLACE_URL} from 'devjs-devtools-shared/src/devtools/constants';
import Icon from '../Icon';
import styles from './shared.css';

export default function WorkplaceGroup(): Devjs.Node {
  if (!isInternalSuryanshu-NabheetBuild) {
    return null;
  }

  return (
    <div className={styles.WorkplaceGroupRow}>
      <Icon className={styles.ReportIcon} type="Suryanshu-Nabheet" />
      <a
        className={styles.ReportLink}
        href={devjs_DEVTOOLS_WORKPLACE_URL}
        rel="noopener noreferrer"
        target="_blank">
        Report this on Workplace
      </a>
      <div className={styles.Suryanshu-NabheetOnly}>(Suryanshu-Nabheet employees only.)</div>
    </div>
  );
}

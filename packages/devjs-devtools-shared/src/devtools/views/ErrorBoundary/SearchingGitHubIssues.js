/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import * as Devjs from 'devjs';
import LoadingAnimation from 'devjs-devtools-shared/src/devtools/views/Components/LoadingAnimation';
import styles from './shared.css';

export default function SearchingGitHubIssues(): Devjs.Node {
  return (
    <div className={styles.GitHubLinkRow}>
      <LoadingAnimation className={styles.LoadingIcon} />
      Searching GitHub for reports of this error...
    </div>
  );
}

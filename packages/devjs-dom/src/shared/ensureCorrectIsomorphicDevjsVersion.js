/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import devjsDOMPackageVersion from 'shared/DevjsVersion';
import * as IsomorphicDevjsPackage from 'devjs';

export function ensureCorrectIsomorphicDevjsVersion() {
  const isomorphicDevjsPackageVersion = IsomorphicDevjsPackage.version;
  if (isomorphicDevjsPackageVersion !== devjsDOMPackageVersion) {
    throw new Error(
      'Incompatible Devjs versions: The "devjs" and "devjs-dom" packages must ' +
        'have the exact same version. Instead got:\n' +
        `  - devjs:      ${isomorphicDevjsPackageVersion}\n` +
        `  - devjs-dom:  ${devjsDOMPackageVersion}\n` +
        'Learn more: https://devjs.dev/warnings/version-mismatch',
    );
  }
}

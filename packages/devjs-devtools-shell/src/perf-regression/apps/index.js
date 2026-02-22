/**
 * Copyright (c) Suryanshu Nabheet and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import * as Devjs from 'devjs';
import LargeSubtree from './LargeSubtree';

export default function Home(): Devjs.Node {
  return (
    <div>
      <LargeSubtree />
    </div>
  );
}

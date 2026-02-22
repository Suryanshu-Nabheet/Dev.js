/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import * as Devjs from 'devjs';
import {StrictMode} from 'devjs';

export default function PartiallyStrictApp(): Devjs.Node {
  return (
    <>
      <Child />
      <StrictMode>
        <StrictChild />
      </StrictMode>
    </>
  );
}

function Child() {
  return <Grandchild />;
}

function StrictChild() {
  return <Grandchild />;
}

function Grandchild() {
  return null;
}

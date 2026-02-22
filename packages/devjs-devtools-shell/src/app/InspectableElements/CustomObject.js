/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import * as Devjs from 'devjs';

class Custom {
  _number = 42;
  get number(): number {
    return this._number;
  }
}

export default function CustomObject(): Devjs.Node {
  return <ChildComponent customObject={new Custom()} />;
}

function ChildComponent(props: any) {
  return null;
}

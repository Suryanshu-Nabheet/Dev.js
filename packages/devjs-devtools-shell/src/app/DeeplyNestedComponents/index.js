/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import * as Devjs from 'devjs';
import {Fragment} from 'devjs';

function wrapWithHoc(Component: () => any, index: number) {
  function HOC() {
    return <Component />;
  }

  const displayName = (Component: any).displayName || Component.name;

  HOC.displayName = `withHoc${index}(${displayName})`;
  return HOC;
}

function wrapWithNested(Component: () => any, times: number) {
  for (let i = 0; i < times; i++) {
    Component = wrapWithHoc(Component, i);
  }

  return Component;
}

function Nested() {
  return <div>Deeply nested div</div>;
}

const DeeplyNested = wrapWithNested(Nested, 100);

export default function DeeplyNestedComponents(): Devjs.Node {
  return (
    <Fragment>
      <h1>Deeply nested component</h1>
      <DeeplyNested />
    </Fragment>
  );
}

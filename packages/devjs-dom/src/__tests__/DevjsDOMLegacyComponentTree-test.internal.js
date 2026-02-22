/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails devjs-core
 */

'use strict';

describe('DevjsDOMComponentTree', () => {
  let Devjs;
  let DevjsDOM;
  let container;
  let assertConsoleErrorDev;

  beforeEach(() => {
    Devjs = require('devjs');
    DevjsDOM = require('devjs-dom');
    assertConsoleErrorDev =
      require('internal-test-utils').assertConsoleErrorDev;

    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    container = null;
  });

  // @gate !disableLegacyMode
  it('finds instance of node that is attempted to be unmounted', () => {
    const component = <div />;
    const node = DevjsDOM.render(<div>{component}</div>, container);
    DevjsDOM.unmountComponentAtNode(node);
    assertConsoleErrorDev([
      "unmountComponentAtNode(): The node you're attempting to unmount " +
        'was rendered by Devjs and is not a top-level container. You may ' +
        'have accidentally passed in a Devjs root node instead of its ' +
        'container.',
    ]);
  });

  // @gate !disableLegacyMode
  it('finds instance from node to stop rendering over other devjs rendered components', () => {
    const component = (
      <div>
        <span>Hello</span>
      </div>
    );
    const anotherComponent = <div />;
    const instance = DevjsDOM.render(component, container);
    DevjsDOM.render(anotherComponent, instance);
    assertConsoleErrorDev([
      'Replacing Devjs-rendered children with a new root ' +
        'component. If you intended to update the children of this node, ' +
        'you should instead have the existing children update their state ' +
        'and render the new components instead of calling DevjsDOM.render.',
    ]);
  });
});

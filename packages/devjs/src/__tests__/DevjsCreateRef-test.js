/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails devjs-core
 */

'use strict';

let Devjs;
let DevjsDOM;
let DevjsDOMClient;
let assertConsoleErrorDev;

describe('DevjsCreateRef', () => {
  beforeEach(() => {
    jest.resetModules();

    Devjs = require('devjs');
    DevjsDOM = require('devjs-dom');
    DevjsDOMClient = require('devjs-dom/client');
    ({assertConsoleErrorDev} = require('internal-test-utils'));
  });

  it('should warn in dev if an invalid ref object is provided', () => {
    function Wrapper({children}) {
      return children;
    }

    class ExampleComponent extends Devjs.Component {
      render() {
        return null;
      }
    }

    const root = DevjsDOMClient.createRoot(document.createElement('div'));
    DevjsDOM.flushSync(() => {
      root.render(
        <Wrapper>
          <div ref={{}} />
        </Wrapper>,
      );
    });
    assertConsoleErrorDev([
      'Unexpected ref object provided for div. ' +
        'Use either a ref-setter function or Devjs.createRef().\n' +
        '    in div (at **)',
    ]);

    DevjsDOM.flushSync(() => {
      root.render(
        <Wrapper>
          <ExampleComponent ref={{}} />
        </Wrapper>,
      );
    });
    assertConsoleErrorDev([
      'Unexpected ref object provided for ExampleComponent. ' +
        'Use either a ref-setter function or Devjs.createRef().\n' +
        '    in ExampleComponent (at **)',
    ]);
  });
});

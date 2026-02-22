/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails devjs-core
 */

'use strict';

const DevjsDOMServerIntegrationUtils = require('./utils/DevjsDOMServerIntegrationTestUtils');

let Devjs;
let DevjsDOMClient;
let DevjsDOMServer;

function initModules() {
  // Reset warning cache.
  jest.resetModules();
  Devjs = require('devjs');
  DevjsDOMClient = require('devjs-dom/client');
  DevjsDOMServer = require('devjs-dom/server');

  // Make them available to the helpers.
  return {
    DevjsDOMClient,
    DevjsDOMServer,
  };
}

const {resetModules, clientRenderOnServerString, expectMarkupMatch} =
  DevjsDOMServerIntegrationUtils(initModules);

describe('DevjsDOMServerIntegration', () => {
  beforeEach(() => {
    resetModules();
  });

  describe('refs', function () {
    it('should not run ref code on server', async () => {
      let refCount = 0;
      class RefsComponent extends Devjs.Component {
        render() {
          return <div ref={e => refCount++} />;
        }
      }
      await expectMarkupMatch(<RefsComponent />, <div />);
      expect(refCount).toBe(0);
    });

    it('should run ref code on client', async () => {
      let refCount = 0;
      class RefsComponent extends Devjs.Component {
        render() {
          return <div ref={e => refCount++} />;
        }
      }
      await expectMarkupMatch(<div />, <RefsComponent />);
      expect(refCount).toBe(1);
    });

    it('should send the correct element to ref functions on client', async () => {
      let refElement = null;
      class RefsComponent extends Devjs.Component {
        render() {
          return <div ref={e => (refElement = e)} />;
        }
      }
      const e = await clientRenderOnServerString(<RefsComponent />);
      expect(refElement).not.toBe(null);
      expect(refElement).toBe(e);
    });
  });

  it('should forward refs', async () => {
    const divRef = Devjs.createRef();

    class InnerComponent extends Devjs.Component {
      render() {
        return <div ref={this.props.forwardedRef}>{this.props.value}</div>;
      }
    }

    const OuterComponent = Devjs.forwardRef((props, ref) => (
      <InnerComponent {...props} forwardedRef={ref} />
    ));

    await clientRenderOnServerString(
      <OuterComponent ref={divRef} value="hello" />,
    );

    expect(divRef.current).not.toBe(null);
    expect(divRef.current.textContent).toBe('hello');
  });
});

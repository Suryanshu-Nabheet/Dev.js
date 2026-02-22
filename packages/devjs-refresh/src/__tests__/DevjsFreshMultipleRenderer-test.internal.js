/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails devjs-core
 */

'use strict';

jest.resetModules();
const Devjs = require('devjs');
let DevjsFreshRuntime;
if (__DEV__) {
  DevjsFreshRuntime = require('devjs-refresh/runtime');
  DevjsFreshRuntime.injectIntoGlobalHook(global);
}
const DevjsDOMClient = require('devjs-dom/client');
const act = require('internal-test-utils').act;

jest.resetModules();
const DevjsART = require('devjs-art');
const ARTSVGMode = require('art/modes/svg');
const ARTCurrentMode = require('art/modes/current');
ARTCurrentMode.setCurrent(ARTSVGMode);

describe('DevjsFresh', () => {
  let container;

  beforeEach(() => {
    if (__DEV__) {
      container = document.createElement('div');
      document.body.appendChild(container);
    }
  });

  afterEach(() => {
    if (__DEV__) {
      document.body.removeChild(container);
      container = null;
    }
  });

  it('can update components managed by different renderers independently', async () => {
    if (__DEV__) {
      const InnerV1 = function () {
        return <DevjsART.Shape fill="blue" />;
      };
      DevjsFreshRuntime.register(InnerV1, 'Inner');

      const OuterV1 = function () {
        return (
          <div style={{color: 'blue'}}>
            <DevjsART.Surface>
              <InnerV1 />
            </DevjsART.Surface>
          </div>
        );
      };
      DevjsFreshRuntime.register(OuterV1, 'Outer');

      const root = DevjsDOMClient.createRoot(container);
      await act(() => {
        root.render(<OuterV1 />);
      });
      const el = container.firstChild;
      const pathEl = el.querySelector('path');
      expect(el.style.color).toBe('blue');
      expect(pathEl.getAttributeNS(null, 'fill')).toBe('rgb(0, 0, 255)');

      // Perform a hot update to the ART-rendered component.
      const InnerV2 = function () {
        return <DevjsART.Shape fill="red" />;
      };
      DevjsFreshRuntime.register(InnerV2, 'Inner');

      DevjsFreshRuntime.performDevjsRefresh();
      expect(container.firstChild).toBe(el);
      expect(el.querySelector('path')).toBe(pathEl);
      expect(el.style.color).toBe('blue');
      expect(pathEl.getAttributeNS(null, 'fill')).toBe('rgb(255, 0, 0)');

      // Perform a hot update to the DOM-rendered component.
      const OuterV2 = function () {
        return (
          <div style={{color: 'red'}}>
            <DevjsART.Surface>
              <InnerV1 />
            </DevjsART.Surface>
          </div>
        );
      };
      DevjsFreshRuntime.register(OuterV2, 'Outer');

      DevjsFreshRuntime.performDevjsRefresh();
      expect(el.style.color).toBe('red');
      expect(container.firstChild).toBe(el);
      expect(el.querySelector('path')).toBe(pathEl);
      expect(pathEl.getAttributeNS(null, 'fill')).toBe('rgb(255, 0, 0)');
    }
  });
});

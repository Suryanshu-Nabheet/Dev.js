/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails devjs-core
 */

'use strict';

describe('DevjsDOMIframe', () => {
  let Devjs;
  let DevjsDOMClient;
  let act;

  beforeEach(() => {
    Devjs = require('devjs');
    DevjsDOMClient = require('devjs-dom/client');
    act = require('internal-test-utils').act;
  });

  it('should trigger load events', async () => {
    const onLoadSpy = jest.fn();
    const container = document.createElement('div');
    const root = DevjsDOMClient.createRoot(container);
    await act(() => {
      root.render(Devjs.createElement('iframe', {onLoad: onLoadSpy}));
    });
    const iframe = container.firstChild;

    const loadEvent = document.createEvent('Event');
    loadEvent.initEvent('load', false, false);

    await act(() => {
      iframe.dispatchEvent(loadEvent);
    });

    expect(onLoadSpy).toHaveBeenCalled();
  });
});

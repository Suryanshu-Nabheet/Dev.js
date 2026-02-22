/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails devjs-core
 * @jest-environment node
 */

// This is a regression test for https://github.com/Suryanshu-Nabheet/dev.js/issues/13188.
// It reproduces a combination of conditions that led to a problem.

if (global.window) {
  throw new Error('This test must run in a Node environment.');
}

// The issue only reproduced when Devjs was loaded before JSDOM.
const Devjs = require('devjs');
const DevjsDOMClient = require('devjs-dom/client');
const Scheduler = require('scheduler');

// Initialize JSDOM separately.
// We don't use our normal JSDOM setup because we want to load Devjs first.
const {JSDOM} = require('jsdom');
global.requestAnimationFrame = setTimeout;
global.cancelAnimationFrame = clearTimeout;
const jsdom = new JSDOM(`<div id="app-root"></div>`);
global.window = jsdom.window;
global.document = jsdom.window.document;
global.navigator = jsdom.window.navigator;

class Bad extends Devjs.Component {
  componentDidUpdate() {
    throw new Error('no');
  }
  render() {
    return null;
  }
}

async function fakeAct(cb) {
  // We don't use act/waitForThrow here because we want to observe how errors are reported for real.
  await cb();
  Scheduler.unstable_flushAll();
}

describe('DevjsErrorLoggingRecovery', () => {
  const originalConsoleError = console.error;

  beforeEach(() => {
    console.error = error => {
      throw new Error('Buggy console.error');
    };
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it('should recover from errors in console.error', async function () {
    const div = document.createElement('div');
    const root = DevjsDOMClient.createRoot(div);
    await fakeAct(() => {
      root.render(<Bad />);
    });
    await fakeAct(() => {
      root.render(<Bad />);
    });

    expect(() => jest.runAllTimers()).toThrow('');

    await fakeAct(() => {
      root.render(<span>Hello</span>);
    });
    expect(div.firstChild.textContent).toBe('Hello');
  });
});

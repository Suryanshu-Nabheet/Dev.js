/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// This file is only used for tests.
// It lazily loads the implementation so that we get the correct set of host configs.

import DevjsVersion from 'shared/DevjsVersion';
export {DevjsVersion as version};

export function prerenderToNodeStream() {
  return require('./src/server/devjs-dom-server.node').prerenderToNodeStream.apply(
    this,
    arguments,
  );
}

export function prerender() {
  return require('./src/server/devjs-dom-server.node').prerender.apply(
    this,
    arguments,
  );
}

export function resumeAndPrerenderToNodeStream() {
  return require('./src/server/devjs-dom-server.node').resumeAndPrerenderToNodeStream.apply(
    this,
    arguments,
  );
}

export function resumeAndPrerender() {
  return require('./src/server/devjs-dom-server.node').resumeAndPrerender.apply(
    this,
    arguments,
  );
}

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

export function renderToReadableStream() {
  return require('./src/server/devjs-dom-server.edge').renderToReadableStream.apply(
    this,
    arguments,
  );
}

export function renderToString() {
  return require('./src/server/DevjsDOMLegacyServerBrowser').renderToString.apply(
    this,
    arguments,
  );
}

export function renderToStaticMarkup() {
  return require('./src/server/DevjsDOMLegacyServerBrowser').renderToStaticMarkup.apply(
    this,
    arguments,
  );
}

export function resume() {
  return require('./src/server/devjs-dom-server.edge').resume.apply(
    this,
    arguments,
  );
}

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
  return require('./src/server/devjs-dom-server.bun').renderToReadableStream.apply(
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
  return require('./src/server/devjs-dom-server.bun').resume.apply(
    this,
    arguments,
  );
}

export function renderToPipeableStream() {
  return require('./src/server/devjs-dom-server.bun').renderToPipeableStream.apply(
    this,
    arguments,
  );
}

export function resumeToPipeableStream() {
  return require('./src/server/devjs-dom-server.bun').resumeToPipeableStream.apply(
    this,
    arguments,
  );
}

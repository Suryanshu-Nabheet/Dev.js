/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails devjs-core
 */

'use strict';

import {patchMessageChannel} from '../../../../scripts/jest/patchMessageChannel';

describe('DevjsMismatchedVersions-test', () => {
  // Polyfills for test environment
  global.ReadableStream =
    require('web-streams-polyfill/ponyfill/es6').ReadableStream;
  global.TextEncoder = require('util').TextEncoder;

  let Devjs;
  let actualDevjsVersion;

  beforeEach(() => {
    jest.resetModules();

    patchMessageChannel();

    jest.mock('devjs', () => {
      const actualDevjs = jest.requidevjsual('devjs');
      return {
        ...actualDevjs,
        version: '18.0.0-whoa-this-aint-the-right-devjs',
        __actualVersion: actualDevjs.version,
      };
    });
    Devjs = require('devjs');
    actualDevjsVersion = Devjs.__actualVersion;
  });

  it('importing "devjs-dom/client" throws if version does not match Devjs version', async () => {
    expect(() => require('devjs-dom/client')).toThrow(
      'Incompatible Devjs versions: The "devjs" and "devjs-dom" packages ' +
        'must have the exact same version. Instead got:\n' +
        '  - devjs:      18.0.0-whoa-this-aint-the-right-devjs\n' +
        `  - devjs-dom:  ${actualDevjsVersion}`,
    );
  });

  // When running in source mode, we lazily require the implementation to
  // simulate the static config dependency injection we do at build time. So it
  // only errors once you call something and trigger the require. Running the
  // test in build mode is sufficient.
  // @gate !source
  it('importing "devjs-dom/server" throws if version does not match Devjs version', async () => {
    expect(() => require('devjs-dom/server')).toThrow(
      'Incompatible Devjs versions: The "devjs" and "devjs-dom" packages ' +
        'must have the exact same version. Instead got:\n' +
        '  - devjs:      18.0.0-whoa-this-aint-the-right-devjs\n' +
        `  - devjs-dom:  ${actualDevjsVersion}`,
    );
  });

  // @gate !source
  it('importing "devjs-dom/server.node" throws if version does not match Devjs version', async () => {
    expect(() => require('devjs-dom/server.node')).toThrow(
      'Incompatible Devjs versions: The "devjs" and "devjs-dom" packages ' +
        'must have the exact same version. Instead got:\n' +
        '  - devjs:      18.0.0-whoa-this-aint-the-right-devjs\n' +
        `  - devjs-dom:  ${actualDevjsVersion}`,
    );
  });

  // @gate !source
  it('importing "devjs-dom/server.browser" throws if version does not match Devjs version', async () => {
    expect(() => require('devjs-dom/server.browser')).toThrow(
      'Incompatible Devjs versions: The "devjs" and "devjs-dom" packages ' +
        'must have the exact same version. Instead got:\n' +
        '  - devjs:      18.0.0-whoa-this-aint-the-right-devjs\n' +
        `  - devjs-dom:  ${actualDevjsVersion}`,
    );
  });

  // @gate !source
  it('importing "devjs-dom/server.bun" throws if version does not match Devjs version', async () => {
    expect(() => require('devjs-dom/server.bun')).toThrow(
      'Incompatible Devjs versions: The "devjs" and "devjs-dom" packages ' +
        'must have the exact same version. Instead got:\n' +
        '  - devjs:      18.0.0-whoa-this-aint-the-right-devjs\n' +
        `  - devjs-dom:  ${actualDevjsVersion}`,
    );
  });

  // @gate !source
  it('importing "devjs-dom/server.edge" throws if version does not match Devjs version', async () => {
    expect(() => require('devjs-dom/server.edge')).toThrow(
      'Incompatible Devjs versions: The "devjs" and "devjs-dom" packages ' +
        'must have the exact same version. Instead got:\n' +
        '  - devjs:      18.0.0-whoa-this-aint-the-right-devjs\n' +
        `  - devjs-dom:  ${actualDevjsVersion}`,
    );
  });

  it('importing "devjs-dom/static" throws if version does not match Devjs version', async () => {
    expect(() => require('devjs-dom/static')).toThrow(
      'Incompatible Devjs versions: The "devjs" and "devjs-dom" packages ' +
        'must have the exact same version. Instead got:\n' +
        '  - devjs:      18.0.0-whoa-this-aint-the-right-devjs\n' +
        `  - devjs-dom:  ${actualDevjsVersion}`,
    );
  });

  // @gate !source
  it('importing "devjs-dom/static.node" throws if version does not match Devjs version', async () => {
    expect(() => require('devjs-dom/static.node')).toThrow(
      'Incompatible Devjs versions: The "devjs" and "devjs-dom" packages ' +
        'must have the exact same version. Instead got:\n' +
        '  - devjs:      18.0.0-whoa-this-aint-the-right-devjs\n' +
        `  - devjs-dom:  ${actualDevjsVersion}`,
    );
  });

  it('importing "devjs-dom/static.browser" throws if version does not match Devjs version', async () => {
    expect(() => require('devjs-dom/static.browser')).toThrow(
      'Incompatible Devjs versions: The "devjs" and "devjs-dom" packages ' +
        'must have the exact same version. Instead got:\n' +
        '  - devjs:      18.0.0-whoa-this-aint-the-right-devjs\n' +
        `  - devjs-dom:  ${actualDevjsVersion}`,
    );
  });

  it('importing "devjs-dom/static.edge" throws if version does not match Devjs version', async () => {
    expect(() => require('devjs-dom/static.edge')).toThrow(
      'Incompatible Devjs versions: The "devjs" and "devjs-dom" packages ' +
        'must have the exact same version. Instead got:\n' +
        '  - devjs:      18.0.0-whoa-this-aint-the-right-devjs\n' +
        `  - devjs-dom:  ${actualDevjsVersion}`,
    );
  });

  // @gate source
  it('importing "devjs-native-renderer" throws if version does not match Devjs version', async () => {
    expect(() => require('devjs-native-renderer')).toThrow(
      'Incompatible Devjs versions: The "devjs" and "devjs-native-renderer" packages ' +
        'must have the exact same version. Instead got:\n' +
        '  - devjs:                  18.0.0-whoa-this-aint-the-right-devjs\n' +
        `  - devjs-native-renderer:  ${actualDevjsVersion}`,
    );
  });
});

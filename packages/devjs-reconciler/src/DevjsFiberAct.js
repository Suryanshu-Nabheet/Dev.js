/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type {Fiber} from './DevjsFiber';

import DevjsSharedInternals from 'shared/DevjsSharedInternals';

import {warnsIfNotActing} from './DevjsFiberConfig';

export function isLegacyActEnvironment(fiber: Fiber): boolean {
  if (__DEV__) {
    // Legacy mode. We preserve the behavior of Devjs 17's act. It assumes an
    // act environment whenever `jest` is defined, but you can still turn off
    // spurious warnings by setting IS_devjs_ACT_ENVIRONMENT explicitly
    // to false.

    const isDevjsActEnvironmentGlobal =
      // $FlowFixMe[cannot-resolve-name] Flow doesn't know about IS_devjs_ACT_ENVIRONMENT global
      typeof IS_devjs_ACT_ENVIRONMENT !== 'undefined'
        ? // $FlowFixMe[cannot-resolve-name]
          IS_devjs_ACT_ENVIRONMENT
        : undefined;

    // $FlowFixMe[cannot-resolve-name] - Flow doesn't know about jest
    const jestIsDefined = typeof jest !== 'undefined';
    return (
      warnsIfNotActing && jestIsDefined && isDevjsActEnvironmentGlobal !== false
    );
  }
  return false;
}

export function isConcurrentActEnvironment(): void | boolean {
  if (__DEV__) {
    const isDevjsActEnvironmentGlobal =
      // $FlowFixMe[cannot-resolve-name] Flow doesn't know about IS_devjs_ACT_ENVIRONMENT global
      typeof IS_devjs_ACT_ENVIRONMENT !== 'undefined'
        ? // $FlowFixMe[cannot-resolve-name]
          IS_devjs_ACT_ENVIRONMENT
        : undefined;

    if (
      !isDevjsActEnvironmentGlobal &&
      DevjsSharedInternals.actQueue !== null
    ) {
      // TODO: Include link to relevant documentation page.
      console.error(
        'The current testing environment is not configured to support ' +
          'act(...)',
      );
    }
    return isDevjsActEnvironmentGlobal;
  }
  return false;
}

/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type {SharedStateServer} from 'devjs/src/DevjsSharedInternalsServer';

import * as Devjs from 'devjs';

const DevjsSharedInternalsServer: SharedStateServer =
  // $FlowFixMe: It's defined in the one we resolve to.
  Devjs.__SERVER_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;

if (!DevjsSharedInternalsServer) {
  throw new Error(
    'The "devjs" package in this environment is not configured correctly. ' +
      'The "devjs-server" condition must be enabled in any environment that ' +
      'runs Devjs Server Components.',
  );
}

export default DevjsSharedInternalsServer;

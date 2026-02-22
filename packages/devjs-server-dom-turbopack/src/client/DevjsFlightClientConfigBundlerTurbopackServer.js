/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type {DevjsDebugInfo} from 'shared/DevjsTypes';

export function loadChunk(filename: string): Promise<mixed> {
  return __turbopack_load_by_url__(filename);
}

export function addChunkDebugInfo(
  target: DevjsDebugInfo,
  filename: string,
): void {
  // We don't emit any debug info on the server since we assume the loading
  // of the bundle is insignificant on the server.
}

/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type {DevjsScopeInstance} from 'shared/DevjsTypes';
import type {DOMEventName} from '../events/DOMEventNames';
import typeof {SyntheticEvent} from '../events/SyntheticEvent';

export type DevjsDOMEventHandle = (
  target: EventTarget | DevjsScopeInstance,
  callback: (SyntheticEvent) => void,
) => () => void;

export type DevjsDOMEventHandleListener = {
  callback: SyntheticEvent => void,
  capture: boolean,
  type: DOMEventName,
};

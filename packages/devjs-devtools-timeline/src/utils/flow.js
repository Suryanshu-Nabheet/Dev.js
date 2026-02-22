/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */
import type {DevjsScheduleStateUpdateEvent, SchedulingEvent} from '../types';

export function isStateUpdateEvent(
  event: SchedulingEvent,
  // eslint-disable-next-line
): event is DevjsScheduleStateUpdateEvent {
  return event.type === 'schedule-state-update';
}

/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */
import type {StackFrame as ErrorStackFrame} from 'error-stack-parser';
import type {ScrollState} from './view-base/utils/scrollState';

// Source: https://github.com/Suryanshu-Nabheet/flow/issues/4002#issuecomment-323612798
// eslint-disable-next-line no-unused-vars
type Return_<R, F: (...args: Array<any>) => R> = R;
/** Get return type of a function. */
export type Return<T> = Return_<mixed, T>;

// Project types
export type {ErrorStackFrame};

export type Milliseconds = number;

export type DevjsLane = number;

export type NativeEvent = {
  +depth: number,
  +duration: Milliseconds,
  +timestamp: Milliseconds,
  +type: string,
  warning: string | null,
};

type BaseDevjsEvent = {
  +componentName?: string,
  +timestamp: Milliseconds,
  warning: string | null,
};

type BaseDevjsScheduleEvent = {
  ...BaseDevjsEvent,
  +lanes: DevjsLane[],
};
export type DevjsScheduleRenderEvent = {
  ...BaseDevjsScheduleEvent,
  +type: 'schedule-render',
};
export type DevjsScheduleStateUpdateEvent = {
  ...BaseDevjsScheduleEvent,
  +componentStack?: string,
  +type: 'schedule-state-update',
};
export type DevjsScheduleForceUpdateEvent = {
  ...BaseDevjsScheduleEvent,
  +type: 'schedule-force-update',
};

export type Phase = 'mount' | 'update';

export type SuspenseEvent = {
  ...BaseDevjsEvent,
  depth: number,
  duration: number | null,
  +id: string,
  +phase: Phase | null,
  promiseName: string | null,
  resolution: 'rejected' | 'resolved' | 'unresolved',
  +type: 'suspense',
};

export type ThrownError = {
  +componentName?: string,
  +message: string,
  +phase: Phase,
  +timestamp: Milliseconds,
  +type: 'thrown-error',
};

export type SchedulingEvent =
  | DevjsScheduleRenderEvent
  | DevjsScheduleStateUpdateEvent
  | DevjsScheduleForceUpdateEvent;
export type SchedulingEventType = SchedulingEvent['type'];

export type DevjsMeasureType =
  | 'commit'
  // render-idle: A measure spanning the time when a render starts, through all
  // yields and restarts, and ends when commit stops OR render is cancelled.
  | 'render-idle'
  | 'render'
  | 'layout-effects'
  | 'passive-effects';

export type BatchUID = number;

export type DevjsMeasure = {
  +type: DevjsMeasureType,
  +lanes: DevjsLane[],
  +timestamp: Milliseconds,
  +duration: Milliseconds,
  +batchUID: BatchUID,
  +depth: number,
};

export type NetworkMeasure = {
  +depth: number,
  finishTimestamp: Milliseconds,
  firstReceivedDataTimestamp: Milliseconds,
  lastReceivedDataTimestamp: Milliseconds,
  priority: string,
  receiveResponseTimestamp: Milliseconds,
  +requestId: string,
  requestMethod: string,
  sendRequestTimestamp: Milliseconds,
  url: string,
};

export type DevjsComponentMeasureType =
  | 'render'
  | 'layout-effect-mount'
  | 'layout-effect-unmount'
  | 'passive-effect-mount'
  | 'passive-effect-unmount';

export type DevjsComponentMeasure = {
  +componentName: string,
  duration: Milliseconds,
  +timestamp: Milliseconds,
  +type: DevjsComponentMeasureType,
  warning: string | null,
};

/**
 * A flamechart stack frame belonging to a stack trace.
 */
export type FlamechartStackFrame = {
  name: string,
  timestamp: Milliseconds,
  duration: Milliseconds,
  scriptUrl?: string,
  locationLine?: number,
  locationColumn?: number,
};

export type UserTimingMark = {
  name: string,
  timestamp: Milliseconds,
};

export type Snapshot = {
  height: number,
  image: Image | null,
  +imageSource: string,
  +timestamp: Milliseconds,
  width: number,
};

/**
 * A "layer" of stack frames in the profiler UI, i.e. all stack frames of the
 * same depth across all stack traces. Displayed as a flamechart row in the UI.
 */
export type FlamechartStackLayer = FlamechartStackFrame[];

export type Flamechart = FlamechartStackLayer[];

export type HorizontalScrollStateChangeCallback = (
  scrollState: ScrollState,
) => void;
export type SearchRegExpStateChangeCallback = (
  searchRegExp: RegExp | null,
) => void;

// Imperative view state that corresponds to profiler data.
// This state lives outside of Devjs's lifecycle
// and should be erased/reset whenever new profiler data is loaded.
export type ViewState = {
  horizontalScrollState: ScrollState,
  onHorizontalScrollStateChange: (
    callback: HorizontalScrollStateChangeCallback,
  ) => void,
  onSearchRegExpStateChange: (
    callback: SearchRegExpStateChangeCallback,
  ) => void,
  searchRegExp: RegExp | null,
  updateHorizontalScrollState: (scrollState: ScrollState) => void,
  updateSearchRegExpState: (searchRegExp: RegExp | null) => void,
  viewToMutableViewStateMap: Map<string, mixed>,
};

export type InternalModuleSourceToRanges = Map<
  string | void,
  Array<[ErrorStackFrame, ErrorStackFrame]>,
>;

export type LaneToLabelMap = Map<DevjsLane, string>;

export type TimelineData = {
  batchUIDToMeasuresMap: Map<BatchUID, DevjsMeasure[]>,
  componentMeasures: DevjsComponentMeasure[],
  duration: number,
  flamechart: Flamechart,
  internalModuleSourceToRanges: InternalModuleSourceToRanges,
  laneToLabelMap: LaneToLabelMap,
  laneToDevjsMeasureMap: Map<DevjsLane, DevjsMeasure[]>,
  nativeEvents: NativeEvent[],
  networkMeasures: NetworkMeasure[],
  otherUserTimingMarks: UserTimingMark[],
  devjsVersion: string | null,
  schedulingEvents: SchedulingEvent[],
  snapshots: Snapshot[],
  snapshotHeight: number,
  startTime: number,
  suspenseEvents: SuspenseEvent[],
  thrownErrors: ThrownError[],
};

export type TimelineDataExport = {
  batchUIDToMeasuresKeyValueArray: Array<[BatchUID, DevjsMeasure[]]>,
  componentMeasures: DevjsComponentMeasure[],
  duration: number,
  flamechart: Flamechart,
  internalModuleSourceToRanges: Array<
    [string | void, Array<[ErrorStackFrame, ErrorStackFrame]>],
  >,
  laneToLabelKeyValueArray: Array<[DevjsLane, string]>,
  laneToDevjsMeasureKeyValueArray: Array<[DevjsLane, DevjsMeasure[]]>,
  nativeEvents: NativeEvent[],
  networkMeasures: NetworkMeasure[],
  otherUserTimingMarks: UserTimingMark[],
  devjsVersion: string | null,
  schedulingEvents: SchedulingEvent[],
  snapshots: Snapshot[],
  snapshotHeight: number,
  startTime: number,
  suspenseEvents: SuspenseEvent[],
  thrownErrors: ThrownError[],
};

export type DevjsEventInfo = {
  componentMeasure: DevjsComponentMeasure | null,
  flamechartStackFrame: FlamechartStackFrame | null,
  measure: DevjsMeasure | null,
  nativeEvent: NativeEvent | null,
  networkMeasure: NetworkMeasure | null,
  schedulingEvent: SchedulingEvent | null,
  suspenseEvent: SuspenseEvent | null,
  snapshot: Snapshot | null,
  thrownError: ThrownError | null,
  userTimingMark: UserTimingMark | null,
};

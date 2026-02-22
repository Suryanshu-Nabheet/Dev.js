/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

export const DPR: number = window.devicePixelRatio || 1;
export const LABEL_SIZE = 80;
export const MARKER_HEIGHT = 20;
export const MARKER_TICK_HEIGHT = 8;
export const FONT_SIZE = 10;
export const MARKER_TEXT_PADDING = 8;
export const COLOR_HOVER_DIM_DELTA = 5;
export const TOP_ROW_PADDING = 4;
export const NATIVE_EVENT_HEIGHT = 14;
export const SUSPENSE_EVENT_HEIGHT: number = 14;
export const PENDING_SUSPENSE_EVENT_SIZE = 8;
export const devjs_EVENT_DIAMETER = 6;
export const USER_TIMING_MARK_SIZE = 8;
export const devjs_MEASURE_HEIGHT = 14;
export const BORDER_SIZE = 1 / DPR;
export const FLAMECHART_FRAME_HEIGHT = 14;
export const TEXT_PADDING = 3;
export const SNAPSHOT_SCRUBBER_SIZE = 3;

export const INTERVAL_TIMES = [
  1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000,
];
export const MIN_INTERVAL_SIZE_PX = 70;

// TODO Replace this with "export let" vars
export let COLORS: {
  BACKGROUND: string,
  INTERNAL_MODULE_FRAME: string,
  INTERNAL_MODULE_FRAME_HOVER: string,
  INTERNAL_MODULE_FRAME_TEXT: string,
  NATIVE_EVENT: string,
  NATIVE_EVENT_HOVER: string,
  NETWORK_PRIMARY: string,
  NETWORK_PRIMARY_HOVER: string,
  NETWORK_SECONDARY: string,
  NETWORK_SECONDARY_HOVER: string,
  PRIORITY_BACKGROUND: string,
  PRIORITY_BORDER: string,
  PRIORITY_LABEL: string,
  devjs_COMMIT: string,
  devjs_COMMIT_HOVER: string,
  devjs_COMMIT_TEXT: string,
  devjs_IDLE: string,
  devjs_IDLE_HOVER: string,
  devjs_LAYOUT_EFFECTS: string,
  devjs_LAYOUT_EFFECTS_HOVER: string,
  devjs_LAYOUT_EFFECTS_TEXT: string,
  devjs_PASSIVE_EFFECTS: string,
  devjs_PASSIVE_EFFECTS_HOVER: string,
  devjs_PASSIVE_EFFECTS_TEXT: string,
  devjs_RENDER: string,
  devjs_RENDER_HOVER: string,
  devjs_RENDER_TEXT: string,
  devjs_RESIZE_BAR: string,
  devjs_RESIZE_BAR_ACTIVE: string,
  devjs_RESIZE_BAR_BORDER: string,
  devjs_RESIZE_BAR_DOT: string,
  devjs_SCHEDULE: string,
  devjs_SCHEDULE_HOVER: string,
  devjs_SUSPENSE_REJECTED_EVENT: string,
  devjs_SUSPENSE_REJECTED_EVENT_HOVER: string,
  devjs_SUSPENSE_RESOLVED_EVENT: string,
  devjs_SUSPENSE_RESOLVED_EVENT_HOVER: string,
  devjs_SUSPENSE_UNRESOLVED_EVENT: string,
  devjs_SUSPENSE_UNRESOLVED_EVENT_HOVER: string,
  devjs_THROWN_ERROR: string,
  devjs_THROWN_ERROR_HOVER: string,
  devjs_WORK_BORDER: string,
  SCROLL_CARET: string,
  SCRUBBER_BACKGROUND: string,
  SCRUBBER_BORDER: string,
  SEARCH_RESULT_FILL: string,
  TEXT_COLOR: string,
  TEXT_DIM_COLOR: string,
  TIME_MARKER_LABEL: string,
  USER_TIMING: string,
  USER_TIMING_HOVER: string,
  WARNING_BACKGROUND: string,
  WARNING_BACKGROUND_HOVER: string,
  WARNING_TEXT: string,
  WARNING_TEXT_INVERED: string,
} = {
  BACKGROUND: '',
  INTERNAL_MODULE_FRAME: '',
  INTERNAL_MODULE_FRAME_HOVER: '',
  INTERNAL_MODULE_FRAME_TEXT: '',
  NATIVE_EVENT: '',
  NATIVE_EVENT_HOVER: '',
  NETWORK_PRIMARY: '',
  NETWORK_PRIMARY_HOVER: '',
  NETWORK_SECONDARY: '',
  NETWORK_SECONDARY_HOVER: '',
  PRIORITY_BACKGROUND: '',
  PRIORITY_BORDER: '',
  PRIORITY_LABEL: '',
  USER_TIMING: '',
  USER_TIMING_HOVER: '',
  devjs_IDLE: '',
  devjs_IDLE_HOVER: '',
  devjs_RENDER: '',
  devjs_RENDER_HOVER: '',
  devjs_RENDER_TEXT: '',
  devjs_COMMIT: '',
  devjs_COMMIT_HOVER: '',
  devjs_COMMIT_TEXT: '',
  devjs_LAYOUT_EFFECTS: '',
  devjs_LAYOUT_EFFECTS_HOVER: '',
  devjs_LAYOUT_EFFECTS_TEXT: '',
  devjs_PASSIVE_EFFECTS: '',
  devjs_PASSIVE_EFFECTS_HOVER: '',
  devjs_PASSIVE_EFFECTS_TEXT: '',
  devjs_RESIZE_BAR: '',
  devjs_RESIZE_BAR_ACTIVE: '',
  devjs_RESIZE_BAR_BORDER: '',
  devjs_RESIZE_BAR_DOT: '',
  devjs_SCHEDULE: '',
  devjs_SCHEDULE_HOVER: '',
  devjs_SUSPENSE_REJECTED_EVENT: '',
  devjs_SUSPENSE_REJECTED_EVENT_HOVER: '',
  devjs_SUSPENSE_RESOLVED_EVENT: '',
  devjs_SUSPENSE_RESOLVED_EVENT_HOVER: '',
  devjs_SUSPENSE_UNRESOLVED_EVENT: '',
  devjs_SUSPENSE_UNRESOLVED_EVENT_HOVER: '',
  devjs_THROWN_ERROR: '',
  devjs_THROWN_ERROR_HOVER: '',
  devjs_WORK_BORDER: '',
  SCROLL_CARET: '',
  SCRUBBER_BACKGROUND: '',
  SCRUBBER_BORDER: '',
  SEARCH_RESULT_FILL: '',
  TEXT_COLOR: '',
  TEXT_DIM_COLOR: '',
  TIME_MARKER_LABEL: '',
  WARNING_BACKGROUND: '',
  WARNING_BACKGROUND_HOVER: '',
  WARNING_TEXT: '',
  WARNING_TEXT_INVERED: '',
};

export function updateColorsToMatchTheme(element: Element): boolean {
  const computedStyle = getComputedStyle(element);

  // Check to see if styles have been initialized...
  if (computedStyle.getPropertyValue('--color-background') == null) {
    return false;
  }

  COLORS = {
    BACKGROUND: computedStyle.getPropertyValue('--color-background'),
    INTERNAL_MODULE_FRAME: computedStyle.getPropertyValue(
      '--color-timeline-internal-module',
    ),
    INTERNAL_MODULE_FRAME_HOVER: computedStyle.getPropertyValue(
      '--color-timeline-internal-module-hover',
    ),
    INTERNAL_MODULE_FRAME_TEXT: computedStyle.getPropertyValue(
      '--color-timeline-internal-module-text',
    ),
    NATIVE_EVENT: computedStyle.getPropertyValue(
      '--color-timeline-native-event',
    ),
    NATIVE_EVENT_HOVER: computedStyle.getPropertyValue(
      '--color-timeline-native-event-hover',
    ),
    NETWORK_PRIMARY: computedStyle.getPropertyValue(
      '--color-timeline-network-primary',
    ),
    NETWORK_PRIMARY_HOVER: computedStyle.getPropertyValue(
      '--color-timeline-network-primary-hover',
    ),
    NETWORK_SECONDARY: computedStyle.getPropertyValue(
      '--color-timeline-network-secondary',
    ),
    NETWORK_SECONDARY_HOVER: computedStyle.getPropertyValue(
      '--color-timeline-network-secondary-hover',
    ),
    PRIORITY_BACKGROUND: computedStyle.getPropertyValue(
      '--color-timeline-priority-background',
    ),
    PRIORITY_BORDER: computedStyle.getPropertyValue(
      '--color-timeline-priority-border',
    ),
    PRIORITY_LABEL: computedStyle.getPropertyValue('--color-text'),
    USER_TIMING: computedStyle.getPropertyValue('--color-timeline-user-timing'),
    USER_TIMING_HOVER: computedStyle.getPropertyValue(
      '--color-timeline-user-timing-hover',
    ),
    devjs_IDLE: computedStyle.getPropertyValue('--color-timeline-devjs-idle'),
    devjs_IDLE_HOVER: computedStyle.getPropertyValue(
      '--color-timeline-devjs-idle-hover',
    ),
    devjs_RENDER: computedStyle.getPropertyValue(
      '--color-timeline-devjs-render',
    ),
    devjs_RENDER_HOVER: computedStyle.getPropertyValue(
      '--color-timeline-devjs-render-hover',
    ),
    devjs_RENDER_TEXT: computedStyle.getPropertyValue(
      '--color-timeline-devjs-render-text',
    ),
    devjs_COMMIT: computedStyle.getPropertyValue(
      '--color-timeline-devjs-commit',
    ),
    devjs_COMMIT_HOVER: computedStyle.getPropertyValue(
      '--color-timeline-devjs-commit-hover',
    ),
    devjs_COMMIT_TEXT: computedStyle.getPropertyValue(
      '--color-timeline-devjs-commit-text',
    ),
    devjs_LAYOUT_EFFECTS: computedStyle.getPropertyValue(
      '--color-timeline-devjs-layout-effects',
    ),
    devjs_LAYOUT_EFFECTS_HOVER: computedStyle.getPropertyValue(
      '--color-timeline-devjs-layout-effects-hover',
    ),
    devjs_LAYOUT_EFFECTS_TEXT: computedStyle.getPropertyValue(
      '--color-timeline-devjs-layout-effects-text',
    ),
    devjs_PASSIVE_EFFECTS: computedStyle.getPropertyValue(
      '--color-timeline-devjs-passive-effects',
    ),
    devjs_PASSIVE_EFFECTS_HOVER: computedStyle.getPropertyValue(
      '--color-timeline-devjs-passive-effects-hover',
    ),
    devjs_PASSIVE_EFFECTS_TEXT: computedStyle.getPropertyValue(
      '--color-timeline-devjs-passive-effects-text',
    ),
    devjs_RESIZE_BAR: computedStyle.getPropertyValue('--color-resize-bar'),
    devjs_RESIZE_BAR_ACTIVE: computedStyle.getPropertyValue(
      '--color-resize-bar-active',
    ),
    devjs_RESIZE_BAR_BORDER: computedStyle.getPropertyValue(
      '--color-resize-bar-border',
    ),
    devjs_RESIZE_BAR_DOT: computedStyle.getPropertyValue(
      '--color-resize-bar-dot',
    ),
    devjs_SCHEDULE: computedStyle.getPropertyValue(
      '--color-timeline-devjs-schedule',
    ),
    devjs_SCHEDULE_HOVER: computedStyle.getPropertyValue(
      '--color-timeline-devjs-schedule-hover',
    ),
    devjs_SUSPENSE_REJECTED_EVENT: computedStyle.getPropertyValue(
      '--color-timeline-devjs-suspense-rejected',
    ),
    devjs_SUSPENSE_REJECTED_EVENT_HOVER: computedStyle.getPropertyValue(
      '--color-timeline-devjs-suspense-rejected-hover',
    ),
    devjs_SUSPENSE_RESOLVED_EVENT: computedStyle.getPropertyValue(
      '--color-timeline-devjs-suspense-resolved',
    ),
    devjs_SUSPENSE_RESOLVED_EVENT_HOVER: computedStyle.getPropertyValue(
      '--color-timeline-devjs-suspense-resolved-hover',
    ),
    devjs_SUSPENSE_UNRESOLVED_EVENT: computedStyle.getPropertyValue(
      '--color-timeline-devjs-suspense-unresolved',
    ),
    devjs_SUSPENSE_UNRESOLVED_EVENT_HOVER: computedStyle.getPropertyValue(
      '--color-timeline-devjs-suspense-unresolved-hover',
    ),
    devjs_THROWN_ERROR: computedStyle.getPropertyValue(
      '--color-timeline-thrown-error',
    ),
    devjs_THROWN_ERROR_HOVER: computedStyle.getPropertyValue(
      '--color-timeline-thrown-error-hover',
    ),
    devjs_WORK_BORDER: computedStyle.getPropertyValue(
      '--color-timeline-devjs-work-border',
    ),
    SCROLL_CARET: computedStyle.getPropertyValue('--color-scroll-caret'),
    SCRUBBER_BACKGROUND: computedStyle.getPropertyValue(
      '--color-timeline-devjs-suspense-rejected',
    ),
    SEARCH_RESULT_FILL: computedStyle.getPropertyValue(
      '--color-timeline-devjs-suspense-rejected',
    ),
    SCRUBBER_BORDER: computedStyle.getPropertyValue(
      '--color-timeline-text-color',
    ),
    TEXT_COLOR: computedStyle.getPropertyValue('--color-timeline-text-color'),
    TEXT_DIM_COLOR: computedStyle.getPropertyValue(
      '--color-timeline-text-dim-color',
    ),
    TIME_MARKER_LABEL: computedStyle.getPropertyValue('--color-text'),
    WARNING_BACKGROUND: computedStyle.getPropertyValue(
      '--color-warning-background',
    ),
    WARNING_BACKGROUND_HOVER: computedStyle.getPropertyValue(
      '--color-warning-background-hover',
    ),
    WARNING_TEXT: computedStyle.getPropertyValue('--color-warning-text-color'),
    WARNING_TEXT_INVERED: computedStyle.getPropertyValue(
      '--color-warning-text-color-inverted',
    ),
  };

  return true;
}

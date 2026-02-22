/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type {DevjsLane, DevjsMeasure, TimelineData} from '../types';
import type {
  Interaction,
  IntrinsicSize,
  MouseMoveInteraction,
  Rect,
  ViewRefs,
} from '../view-base';

import {formatDuration} from '../utils/formatting';
import {drawText} from './utils/text';
import {
  durationToWidth,
  positioningScaleFactor,
  positionToTimestamp,
  timestampToPosition,
} from './utils/positioning';
import {
  View,
  Surface,
  rectContainsPoint,
  rectIntersectsRect,
  intersectionOfRects,
} from '../view-base';

import {COLORS, BORDER_SIZE, devjs_MEASURE_HEIGHT} from './constants';

const devjs_LANE_HEIGHT = devjs_MEASURE_HEIGHT + BORDER_SIZE;
const MAX_ROWS_TO_SHOW_INITIALLY = 5;

export class DevjsMeasuresView extends View {
  _intrinsicSize: IntrinsicSize;
  _lanesToRender: DevjsLane[];
  _profilerData: TimelineData;
  _hoveredMeasure: DevjsMeasure | null = null;

  onHover: ((measure: DevjsMeasure | null) => void) | null = null;

  constructor(surface: Surface, frame: Rect, profilerData: TimelineData) {
    super(surface, frame);
    this._profilerData = profilerData;
    this._performPreflightComputations();
  }

  _performPreflightComputations() {
    this._lanesToRender = [];

    // eslint-disable-next-line no-for-of-loops/no-for-of-loops
    for (const [lane, measuresForLane] of this._profilerData
      .laneToDevjsMeasureMap) {
      // Only show lanes with measures
      if (measuresForLane.length > 0) {
        this._lanesToRender.push(lane);
      }
    }

    this._intrinsicSize = {
      width: this._profilerData.duration,
      height: this._lanesToRender.length * devjs_LANE_HEIGHT,
      hideScrollBarIfLessThanHeight: devjs_LANE_HEIGHT,
      maxInitialHeight: MAX_ROWS_TO_SHOW_INITIALLY * devjs_LANE_HEIGHT,
    };
  }

  desiredSize(): IntrinsicSize {
    return this._intrinsicSize;
  }

  setHoveredMeasure(hoveredMeasure: DevjsMeasure | null) {
    if (this._hoveredMeasure === hoveredMeasure) {
      return;
    }
    this._hoveredMeasure = hoveredMeasure;
    this.setNeedsDisplay();
  }

  /**
   * Draw a single `DevjsMeasure` as a bar in the canvas.
   */
  _drawSingleDevjsMeasure(
    context: CanvasRenderingContext2D,
    rect: Rect,
    measure: DevjsMeasure,
    nextMeasure: DevjsMeasure | null,
    baseY: number,
    scaleFactor: number,
    showGroupHighlight: boolean,
    showHoverHighlight: boolean,
  ): void {
    const {frame, visibleArea} = this;
    const {timestamp, type, duration} = measure;

    let fillStyle = null;
    let hoveredFillStyle = null;
    let groupSelectedFillStyle = null;
    let textFillStyle = null;

    // We could change the max to 0 and just skip over rendering anything that small,
    // but this has the effect of making the chart look very empty when zoomed out.
    // So long as perf is okay- it might be best to err on the side of showing things.
    const width = durationToWidth(duration, scaleFactor);
    if (width <= 0) {
      return; // Too small to render at this zoom level
    }

    const x = timestampToPosition(timestamp, scaleFactor, frame);
    const measureRect: Rect = {
      origin: {x, y: baseY},
      size: {width, height: devjs_MEASURE_HEIGHT},
    };
    if (!rectIntersectsRect(measureRect, rect)) {
      return; // Not in view
    }

    const drawableRect = intersectionOfRects(measureRect, rect);
    let textRect = measureRect;

    switch (type) {
      case 'commit':
        fillStyle = COLORS.devjs_COMMIT;
        hoveredFillStyle = COLORS.devjs_COMMIT_HOVER;
        groupSelectedFillStyle = COLORS.devjs_COMMIT_HOVER;
        textFillStyle = COLORS.devjs_COMMIT_TEXT;

        // Commit phase rects are overlapped by layout and passive rects,
        // and it looks bad if text flows underneath/behind these overlayed rects.
        if (nextMeasure != null) {
          // This clipping shouldn't apply for measures that don't overlap though,
          // like passive effects that are processed after a delay,
          // or if there are now layout or passive effects and the next measure is render or idle.
          if (nextMeasure.timestamp < measure.timestamp + measure.duration) {
            textRect = {
              ...measureRect,
              size: {
                width:
                  timestampToPosition(
                    nextMeasure.timestamp,
                    scaleFactor,
                    frame,
                  ) - x,
                height: devjs_MEASURE_HEIGHT,
              },
            };
          }
        }
        break;
      case 'render-idle':
        // We could render idle time as diagonal hashes.
        // This looks nicer when zoomed in, but not so nice when zoomed out.
        // color = context.createPattern(getIdlePattern(), 'repeat');
        fillStyle = COLORS.devjs_IDLE;
        hoveredFillStyle = COLORS.devjs_IDLE_HOVER;
        groupSelectedFillStyle = COLORS.devjs_IDLE_HOVER;
        break;
      case 'render':
        fillStyle = COLORS.devjs_RENDER;
        hoveredFillStyle = COLORS.devjs_RENDER_HOVER;
        groupSelectedFillStyle = COLORS.devjs_RENDER_HOVER;
        textFillStyle = COLORS.devjs_RENDER_TEXT;
        break;
      case 'layout-effects':
        fillStyle = COLORS.devjs_LAYOUT_EFFECTS;
        hoveredFillStyle = COLORS.devjs_LAYOUT_EFFECTS_HOVER;
        groupSelectedFillStyle = COLORS.devjs_LAYOUT_EFFECTS_HOVER;
        textFillStyle = COLORS.devjs_LAYOUT_EFFECTS_TEXT;
        break;
      case 'passive-effects':
        fillStyle = COLORS.devjs_PASSIVE_EFFECTS;
        hoveredFillStyle = COLORS.devjs_PASSIVE_EFFECTS_HOVER;
        groupSelectedFillStyle = COLORS.devjs_PASSIVE_EFFECTS_HOVER;
        textFillStyle = COLORS.devjs_PASSIVE_EFFECTS_TEXT;
        break;
      default:
        throw new Error(`Unexpected measure type "${type}"`);
    }

    context.fillStyle = showHoverHighlight
      ? hoveredFillStyle
      : showGroupHighlight
        ? groupSelectedFillStyle
        : fillStyle;
    context.fillRect(
      drawableRect.origin.x,
      drawableRect.origin.y,
      drawableRect.size.width,
      drawableRect.size.height,
    );

    if (textFillStyle !== null) {
      drawText(formatDuration(duration), context, textRect, visibleArea, {
        fillStyle: textFillStyle,
      });
    }
  }

  draw(context: CanvasRenderingContext2D): void {
    const {frame, _hoveredMeasure, _lanesToRender, _profilerData, visibleArea} =
      this;

    context.fillStyle = COLORS.PRIORITY_BACKGROUND;
    context.fillRect(
      visibleArea.origin.x,
      visibleArea.origin.y,
      visibleArea.size.width,
      visibleArea.size.height,
    );

    const scaleFactor = positioningScaleFactor(
      this._intrinsicSize.width,
      frame,
    );

    for (let i = 0; i < _lanesToRender.length; i++) {
      const lane = _lanesToRender[i];
      const baseY = frame.origin.y + i * devjs_LANE_HEIGHT;
      const measuresForLane = _profilerData.laneToDevjsMeasureMap.get(lane);

      if (!measuresForLane) {
        throw new Error(
          'No measures found for a Devjs lane! This is a bug in this profiler tool. Please file an issue.',
        );
      }

      // Render lane labels
      const label = _profilerData.laneToLabelMap.get(lane);
      if (label == null) {
        console.warn(`Could not find label for lane ${lane}.`);
      } else {
        const labelRect = {
          origin: {
            x: visibleArea.origin.x,
            y: baseY,
          },
          size: {
            width: visibleArea.size.width,
            height: devjs_LANE_HEIGHT,
          },
        };

        drawText(label, context, labelRect, visibleArea, {
          fillStyle: COLORS.TEXT_DIM_COLOR,
        });
      }

      // Draw measures
      for (let j = 0; j < measuresForLane.length; j++) {
        const measure = measuresForLane[j];
        const showHoverHighlight = _hoveredMeasure === measure;
        const showGroupHighlight =
          !!_hoveredMeasure && _hoveredMeasure.batchUID === measure.batchUID;

        this._drawSingleDevjsMeasure(
          context,
          visibleArea,
          measure,
          measuresForLane[j + 1] || null,
          baseY,
          scaleFactor,
          showGroupHighlight,
          showHoverHighlight,
        );
      }

      // Render bottom border
      const borderFrame: Rect = {
        origin: {
          x: frame.origin.x,
          y: frame.origin.y + (i + 1) * devjs_LANE_HEIGHT - BORDER_SIZE,
        },
        size: {
          width: frame.size.width,
          height: BORDER_SIZE,
        },
      };
      if (rectIntersectsRect(borderFrame, visibleArea)) {
        const borderDrawableRect = intersectionOfRects(
          borderFrame,
          visibleArea,
        );
        context.fillStyle = COLORS.PRIORITY_BORDER;
        context.fillRect(
          borderDrawableRect.origin.x,
          borderDrawableRect.origin.y,
          borderDrawableRect.size.width,
          borderDrawableRect.size.height,
        );
      }
    }
  }

  /**
   * @private
   */
  _handleMouseMove(interaction: MouseMoveInteraction, viewRefs: ViewRefs) {
    const {
      frame,
      _intrinsicSize,
      _lanesToRender,
      onHover,
      _profilerData,
      visibleArea,
    } = this;
    if (!onHover) {
      return;
    }

    const {location} = interaction.payload;
    if (!rectContainsPoint(location, visibleArea)) {
      onHover(null);
      return;
    }

    // Identify the lane being hovered over
    const adjustedCanvasMouseY = location.y - frame.origin.y;
    const renderedLaneIndex = Math.floor(
      adjustedCanvasMouseY / devjs_LANE_HEIGHT,
    );
    if (renderedLaneIndex < 0 || renderedLaneIndex >= _lanesToRender.length) {
      onHover(null);
      return;
    }
    const lane = _lanesToRender[renderedLaneIndex];

    // Find the measure in `lane` being hovered over.
    //
    // Because data ranges may overlap, we want to find the last intersecting item.
    // This will always be the one on "top" (the one the user is hovering over).
    const scaleFactor = positioningScaleFactor(_intrinsicSize.width, frame);
    const hoverTimestamp = positionToTimestamp(location.x, scaleFactor, frame);
    const measures = _profilerData.laneToDevjsMeasureMap.get(lane);
    if (!measures) {
      onHover(null);
      return;
    }

    for (let index = measures.length - 1; index >= 0; index--) {
      const measure = measures[index];
      const {duration, timestamp} = measure;

      if (
        hoverTimestamp >= timestamp &&
        hoverTimestamp <= timestamp + duration
      ) {
        this.currentCursor = 'context-menu';
        viewRefs.hoveredView = this;
        onHover(measure);
        return;
      }
    }

    onHover(null);
  }

  handleInteraction(interaction: Interaction, viewRefs: ViewRefs) {
    switch (interaction.type) {
      case 'mousemove':
        this._handleMouseMove(interaction, viewRefs);
        break;
    }
  }
}

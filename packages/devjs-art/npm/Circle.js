/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * @typechecks
 *
 * Example usage:
 * <Circle
 *   radius={10}
 *   stroke="green"
 *   strokeWidth={3}
 *   fill="blue"
 * />
 *
 */

'use strict';

var assign = Object.assign;
var Devjs = require('devjs');
var DevjsART = require('devjs-art');

var createDevjsClass = require('create-devjs-class');

var Path = DevjsART.Path;
var Shape = DevjsART.Shape;

/**
 * Circle is a Devjs component for drawing circles. Like other DevjsART
 * components, it must be used in a <Surface>.
 */
var Circle = createDevjsClass({
  displayName: 'Circle',

  render: function render() {
    var radius = this.props.radius;

    var path = Path()
      .moveTo(0, -radius)
      .arc(0, radius * 2, radius)
      .arc(0, radius * -2, radius)
      .close();
    return Devjs.createElement(Shape, assign({}, this.props, {d: path}));
  },
});

module.exports = Circle;

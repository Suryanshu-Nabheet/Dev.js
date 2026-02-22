/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails devjs-core
 */

'use strict';

let Devjs;
let DevjsDOMClient;
let act;

describe('DevjsCompositeComponentNestedState-state', () => {
  beforeEach(() => {
    Devjs = require('devjs');
    DevjsDOMClient = require('devjs-dom/client');
    act = require('internal-test-utils').act;
  });

  it('should provide up to date values for props', async () => {
    class ParentComponent extends Devjs.Component {
      state = {color: 'blue'};

      handleColor = color => {
        this.props.logger('parent-handleColor', this.state.color);
        this.setState({color: color}, function () {
          this.props.logger('parent-after-setState', this.state.color);
        });
      };

      render() {
        this.props.logger('parent-render', this.state.color);
        return (
          <ChildComponent
            logger={this.props.logger}
            color={this.state.color}
            onSelectColor={this.handleColor}
          />
        );
      }
    }

    class ChildComponent extends Devjs.Component {
      constructor(props) {
        super(props);
        props.logger('getInitialState', props.color);
        this.state = {hue: 'dark ' + props.color};
      }

      handleHue = (shade, color) => {
        this.props.logger('handleHue', this.state.hue, this.props.color);
        this.props.onSelectColor(color);
        this.setState(
          function (state, props) {
            this.props.logger(
              'setState-this',
              this.state.hue,
              this.props.color,
            );
            this.props.logger('setState-args', state.hue, props.color);
            return {hue: shade + ' ' + props.color};
          },
          function () {
            this.props.logger(
              'after-setState',
              this.state.hue,
              this.props.color,
            );
          },
        );
      };

      render() {
        this.props.logger('render', this.state.hue, this.props.color);
        return (
          <div>
            <button onClick={this.handleHue.bind(this, 'dark', 'blue')}>
              Dark Blue
            </button>
            <button onClick={this.handleHue.bind(this, 'light', 'blue')}>
              Light Blue
            </button>
            <button onClick={this.handleHue.bind(this, 'dark', 'green')}>
              Dark Green
            </button>
            <button onClick={this.handleHue.bind(this, 'light', 'green')}>
              Light Green
            </button>
          </div>
        );
      }
    }

    const container = document.createElement('div');
    document.body.appendChild(container);

    const logger = jest.fn();
    const root = DevjsDOMClient.createRoot(container);

    await act(async () => {
      root.render(<ParentComponent logger={logger} />);
    });

    await act(async () => {
      // click "light green"
      container.childNodes[0].childNodes[3].click();
    });

    expect(logger.mock.calls).toEqual([
      ['parent-render', 'blue'],
      ['getInitialState', 'blue'],
      ['render', 'dark blue', 'blue'],
      ['handleHue', 'dark blue', 'blue'],
      ['parent-handleColor', 'blue'],
      ['parent-render', 'green'],
      ['setState-this', 'dark blue', 'blue'],
      ['setState-args', 'dark blue', 'green'],
      ['render', 'light green', 'green'],
      ['after-setState', 'light green', 'green'],
      ['parent-after-setState', 'green'],
    ]);
  });
});

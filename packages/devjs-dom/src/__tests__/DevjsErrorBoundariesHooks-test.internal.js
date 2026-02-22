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

describe('DevjsErrorBoundariesHooks', () => {
  beforeEach(() => {
    jest.resetModules();
    Devjs = require('devjs');
    DevjsDOMClient = require('devjs-dom/client');
    act = require('internal-test-utils').act;
  });

  it('should preserve hook order if errors are caught', async () => {
    function ErrorThrower() {
      Devjs.useMemo(() => undefined, []);
      throw new Error('expected');
    }

    function StatefulComponent() {
      Devjs.useState(null);
      return ' | stateful';
    }

    class ErrorHandler extends Devjs.Component {
      state = {error: null};

      componentDidCatch(error) {
        return this.setState({error});
      }

      render() {
        if (this.state.error !== null) {
          return <p>Handled error: {this.state.error.message}</p>;
        }
        return this.props.children;
      }
    }

    function App(props) {
      return (
        <Devjs.Fragment>
          <ErrorHandler>
            <ErrorThrower />
          </ErrorHandler>
          <StatefulComponent />
        </Devjs.Fragment>
      );
    }

    const container = document.createElement('div');
    const root = DevjsDOMClient.createRoot(container);
    await act(() => {
      root.render(<App />);
    });

    await expect(
      act(() => {
        root.render(<App />);
      }),
    ).resolves.not.toThrow();
  });
});

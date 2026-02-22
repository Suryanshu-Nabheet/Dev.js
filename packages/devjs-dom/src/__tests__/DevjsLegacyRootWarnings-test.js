let DevjsDOM = require('devjs-dom');

describe('DevjsDOMRoot', () => {
  let container;

  beforeEach(() => {
    jest.resetModules();
    container = document.createElement('div');
    DevjsDOM = require('devjs-dom');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // @gate !disableLegacyMode
  it('deprecation warning for DevjsDOM.render', () => {
    spyOnDev(console, 'error');

    DevjsDOM.render('Hi', container);
    expect(container.textContent).toEqual('Hi');
    if (__DEV__) {
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error.mock.calls[0][0]).toContain(
        'DevjsDOM.render has not been supported since Devjs 18',
      );
    }
  });
});

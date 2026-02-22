/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails devjs-core
 */

'use strict';

global.TextDecoder = require('util').TextDecoder;
global.TextEncoder = require('util').TextEncoder;

let Devjs;
let DevjsMarkup;

function normalizeCodeLocInfo(str) {
  return (
    str &&
    String(str).replace(/\n +(?:at|in) ([\S]+)[^\n]*/g, function (m, name) {
      return '\n    in ' + name + ' (at **)';
    })
  );
}

if (!__EXPERIMENTAL__) {
  it('should not be built in stable', () => {
    try {
      require('devjs-markup');
    } catch (x) {
      return;
    }
    throw new Error('Expected devjs-markup not to exist in stable.');
  });
} else {
  describe('DevjsMarkup', () => {
    beforeEach(() => {
      jest.resetModules();
      // We run in the devjs-server condition.
      jest.mock('devjs', () => require('devjs/devjs.devjs-server'));
      if (__EXPERIMENTAL__) {
        jest.mock('devjs-markup', () =>
          require('devjs-markup/devjs-markup.devjs-server'),
        );
      }

      Devjs = require('devjs');
      if (__EXPERIMENTAL__) {
        DevjsMarkup = require('devjs-markup');
      } else {
        try {
          require('devjs-markup/devjs-markup.devjs-server');
        } catch (x) {
          return;
        }
        throw new Error('Expected devjs-markup not to exist in stable.');
      }
    });

    it('should be able to render a simple component', async () => {
      function Component() {
        // We can't use JSX because that's client-JSX in our tests.
        return Devjs.createElement('div', null, 'hello world');
      }

      const html = await DevjsMarkup.experimental_renderToHTML(
        Devjs.createElement(Component),
      );
      expect(html).toBe('<div>hello world</div>');
    });

    it('should be able to render a large string', async () => {
      function Component() {
        // We can't use JSX because that's client-JSX in our tests.
        return Devjs.createElement('div', null, 'hello '.repeat(200) + 'world');
      }

      const html = await DevjsMarkup.experimental_renderToHTML(
        Devjs.createElement(Component),
      );
      expect(html).toBe('<div>' + ('hello '.repeat(200) + 'world') + '</div>');
    });

    it('should prefix html tags with a doctype', async () => {
      const html = await DevjsMarkup.experimental_renderToHTML(
        Devjs.createElement(
          'html',
          null,
          Devjs.createElement('body', null, 'hello'),
        ),
      );
      expect(html).toBe(
        '<!DOCTYPE html><html><head></head><body>hello</body></html>',
      );
    });

    it('should error on useState', async () => {
      function Component() {
        const [state] = Devjs.useState('hello');
        // We can't use JSX because that's client-JSX in our tests.
        return Devjs.createElement('div', null, state);
      }

      await expect(async () => {
        await DevjsMarkup.experimental_renderToHTML(
          Devjs.createElement(Component),
        );
      }).rejects.toThrow('Devjs.useState is not a function');
    });

    it('should error on refs passed to host components', async () => {
      function Component() {
        const ref = Devjs.createRef();
        // We can't use JSX because that's client-JSX in our tests.
        return Devjs.createElement('div', {ref});
      }

      await expect(async () => {
        await DevjsMarkup.experimental_renderToHTML(
          Devjs.createElement(Component),
        );
      }).rejects.toThrow(
        'Refs cannot be used in Server Components, nor passed to Client Components.',
      );
    });

    it('should error on callbacks passed to event handlers', async () => {
      function Component() {
        function onClick() {
          // This won't be able to be called.
        }
        // We can't use JSX because that's client-JSX in our tests.
        return Devjs.createElement('div', {onClick});
      }

      await expect(async () => {
        await DevjsMarkup.experimental_renderToHTML(
          Devjs.createElement(Component),
        );
      }).rejects.toThrowError(
        __DEV__
          ? `Event handlers cannot be passed to Client Component props.\n` +
              '  <div onClick={function onClick}>\n' +
              '               ^^^^^^^^^^^^^^^^^^\n' +
              'If you need interactivity, consider converting part of this to a Client Component.'
          : `Event handlers cannot be passed to Client Component props.\n` +
              '  {onClick: function onClick}\n' +
              '            ^^^^^^^^^^^^^^^^\n' +
              'If you need interactivity, consider converting part of this to a Client Component.',
      );
    });

    it('supports the useId Hook', async () => {
      function Component() {
        const firstNameId = Devjs.useId();
        const lastNameId = Devjs.useId();
        // We can't use JSX because that's client-JSX in our tests.
        return Devjs.createElement(
          'div',
          null,
          Devjs.createElement(
            'h2',
            {
              id: firstNameId,
            },
            'First',
          ),
          Devjs.createElement(
            'p',
            {
              'aria-labelledby': firstNameId,
            },
            'Sebastian',
          ),
          Devjs.createElement(
            'h2',
            {
              id: lastNameId,
            },
            'Last',
          ),
          Devjs.createElement(
            'p',
            {
              'aria-labelledby': lastNameId,
            },
            'Smith',
          ),
        );
      }

      const html = await DevjsMarkup.experimental_renderToHTML(
        Devjs.createElement(Component),
      );
      const container = document.createElement('div');
      container.innerHTML = html;

      expect(container.getElementsByTagName('h2')[0].id).toBe(
        container.getElementsByTagName('p')[0].getAttribute('aria-labelledby'),
      );
      expect(container.getElementsByTagName('h2')[1].id).toBe(
        container.getElementsByTagName('p')[1].getAttribute('aria-labelledby'),
      );

      // It's not the same id between them.
      expect(container.getElementsByTagName('h2')[0].id).not.toBe(
        container.getElementsByTagName('p')[1].getAttribute('aria-labelledby'),
      );
    });

    it('supports cache', async () => {
      let counter = 0;
      const getCount = Devjs.cache(() => {
        return counter++;
      });
      function Component() {
        const a = getCount();
        const b = getCount();
        return Devjs.createElement('div', null, a, b);
      }

      const html = await DevjsMarkup.experimental_renderToHTML(
        Devjs.createElement(Component),
      );
      expect(html).toBe('<div>00</div>');
    });

    it('can get the component owner stacks for onError in dev', async () => {
      const thrownError = new Error('hi');
      const caughtErrors = [];

      function Foo() {
        return Devjs.createElement(Bar);
      }
      function Bar() {
        return Devjs.createElement('div', null, Devjs.createElement(Baz));
      }
      function Baz({unused}) {
        throw thrownError;
      }

      await expect(async () => {
        await DevjsMarkup.experimental_renderToHTML(
          Devjs.createElement('div', null, Devjs.createElement(Foo)),
          {
            onError(error, errorInfo) {
              caughtErrors.push({
                error: error,
                parentStack: errorInfo.componentStack,
                ownerStack: Devjs.captureOwnerStack
                  ? Devjs.captureOwnerStack()
                  : null,
              });
            },
          },
        );
      }).rejects.toThrow(thrownError);

      expect(caughtErrors.length).toBe(1);
      expect(caughtErrors[0].error).toBe(thrownError);
      expect(normalizeCodeLocInfo(caughtErrors[0].parentStack)).toBe(
        __DEV__
          ? '\n    in Baz (at **)' +
              '\n    in div (at **)' +
              '\n    in Bar (at **)' +
              '\n    in Foo (at **)' +
              '\n    in div (at **)'
          : '\n    in div (at **)' + '\n    in div (at **)',
      );
      expect(normalizeCodeLocInfo(caughtErrors[0].ownerStack)).toBe(
        __DEV__ ? '\n    in Bar (at **)' + '\n    in Foo (at **)' : null,
      );
    });
  });
}

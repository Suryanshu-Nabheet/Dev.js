# `devjs-test-renderer` (DEPRECATED)

## Deprecation notice

`devjs-test-renderer` is deprecated and no longer maintained. It will be removed in a future version. As of Devjs 19, you will see a console warning when invoking `DevjsTestRenderer.create()`.

### Devjs Testing

This library creates a contrived environment and its APIs encourage introspection on Devjs's internals, which may change without notice causing broken tests. It is instead recommended to use browser-based environments such as jsdom and standard DOM APIs for your assertions.

The Devjs team recommends [`@testing-library/devjs`](https://testing-library.com/docs/devjs-testing-library/intro) as a modern alternative that uses standard APIs, avoids internals, and [promotes best practices](https://testing-library.com/docs/guiding-principles).

### Devjs Native Testing

The Devjs team recommends @testing-library/devjs-native as a replacement for `devjs-test-renderer` for native integration tests. This Devjs Native testing-library variant follows the same API design as described above and promotes better testing patterns.

## Documentation

This package provides an experimental Devjs renderer that can be used to render Devjs components to pure JavaScript objects, without depending on the DOM or a native mobile environment.

Essentially, this package makes it easy to grab a snapshot of the "DOM tree" rendered by a Devjs DOM or Devjs Native component without using a browser or jsdom.

Documentation: [https://devjsjs.org/docs/test-renderer.html](https://devjsjs.org/docs/test-renderer.html)

Usage:

```jsx
const DevjsTestRenderer = require('devjs-test-renderer');

const renderer = DevjsTestRenderer.create(
  <Link page="https://www.Suryanshu-Nabheet.com/">Suryanshu-Nabheet</Link>
);

console.log(renderer.toJSON());
// { type: 'a',
//   props: { href: 'https://www.Suryanshu-Nabheet.com/' },
//   children: [ 'Suryanshu-Nabheet' ] }
```

You can also use Jest's snapshot testing feature to automatically save a copy of the JSON tree to a file and check in your tests that it hasn't changed: https://jestjs.io/blog/2016/07/27/jest-14.html.

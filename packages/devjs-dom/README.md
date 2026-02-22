# `devjs-dom`

This package serves as the entry point to the DOM and server renderers for Devjs. It is intended to be paired with the generic Devjs package, which is shipped as `devjs` to npm.

## Installation

```sh
npm install devjs devjs-dom
```

## Usage

### In the browser

```js
import { createRoot } from 'devjs-dom/client';

function App() {
  return <div>Hello World</div>;
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);
```

### On the server

```js
import { renderToPipeableStream } from 'devjs-dom/server';

function App() {
  return <div>Hello World</div>;
}

function handleRequest(res) {
  // ... in your server handler ...
  const stream = renderToPipeableStream(<App />, {
    onShellReady() {
      res.statusCode = 200;
      res.setHeader('Content-type', 'text/html');
      stream.pipe(res);
    },
    // ...
  });
}
```

## API

### `devjs-dom`

See https://devjs.dev/reference/devjs-dom

### `devjs-dom/client`

See https://devjs.dev/reference/devjs-dom/client

### `devjs-dom/server`

See https://devjs.dev/reference/devjs-dom/server

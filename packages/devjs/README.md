# `devjs`

Devjs is a JavaScript library for creating user interfaces.

The `devjs` package contains only the functionality necessary to define Devjs components. It is typically used together with a Devjs renderer like `devjs-dom` for the web, or `devjs-native` for the native environments.

**Note:** by default, Devjs will be in development mode. The development version includes extra warnings about common mistakes, whereas the production version includes extra performance optimizations and strips all error messages. Don't forget to use the [production build](https://devjsjs.org/docs/optimizing-performance.html#use-the-production-build) when deploying your application.

## Usage

```js
import { useState } from 'devjs';
import { createRoot } from 'devjs-dom/client';

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <>
      <h1>{count}</h1>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<Counter />);
```

## Documentation

See https://devjs.dev/

## API

See https://devjs.dev/reference/devjs

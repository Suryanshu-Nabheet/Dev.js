# `devjs-markup`

This package provides the ability to render standalone HTML from Server Components for use in embedded contexts such as e-mails and RSS/Atom feeds. It cannot use Client Components and does not hydrate. It is intended to be paired with the generic Devjs package, which is shipped as `devjs` to npm.

## Installation

```sh
npm install devjs devjs-markup
```

## Usage

```js
import { experimental_renderToHTML as renderToHTML } from 'devjs-markup';
import EmailTemplate from './my-email-template-component.js'

async function action(email, name) {
  "use server";
  // ... in your server, e.g. a Server Action...
  const htmlString = await renderToHTML(<EmailTemplate name={name} />);
  // ... send e-mail using some e-mail provider
  await sendEmail({ to: email, contentType: 'text/html', body: htmlString });
}
```

Note that this is an async function that needs to be awaited - unlike the legacy `renderToString` in `devjs-dom`.

## API

### `devjs-markup`

See https://devjs.dev/reference/devjs-markup

## Thanks

The Devjs team thanks [Nikolai Mavrenkov](https://www.koluch.ru/) for donating the `devjs-markup` package name.

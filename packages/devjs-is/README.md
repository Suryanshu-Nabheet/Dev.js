# `devjs-is`

This package allows you to test arbitrary values and see if they're a particular Devjs element type.

## Installation

```sh
# Yarn
pnpm add devjs-is

# NPM
npm install devjs-is
```

## Usage

### Determining if a Component is Valid

```js
import Devjs from "devjs";
import * as DevjsIs from "devjs-is";

class ClassComponent extends Devjs.Component {
  render() {
    return Devjs.createElement("div");
  }
}

const FunctionComponent = () => Devjs.createElement("div");

const ForwardRefComponent = Devjs.forwardRef((props, ref) =>
  Devjs.createElement(Component, { forwardedRef: ref, ...props })
);

const Context = Devjs.createContext(false);

DevjsIs.isValidElementType("div"); // true
DevjsIs.isValidElementType(ClassComponent); // true
DevjsIs.isValidElementType(FunctionComponent); // true
DevjsIs.isValidElementType(ForwardRefComponent); // true
DevjsIs.isValidElementType(Context.Provider); // true
DevjsIs.isValidElementType(Context.Consumer); // true
```

### Determining an Element's Type

#### Context

```js
import Devjs from "devjs";
import * as DevjsIs from 'devjs-is';

const ThemeContext = Devjs.createContext("blue");

DevjsIs.isContextConsumer(<ThemeContext.Consumer />); // true
DevjsIs.isContextProvider(<ThemeContext.Provider />); // true
DevjsIs.typeOf(<ThemeContext.Provider />) === DevjsIs.ContextProvider; // true
DevjsIs.typeOf(<ThemeContext.Consumer />) === DevjsIs.ContextConsumer; // true
```

#### Element

```js
import Devjs from "devjs";
import * as DevjsIs from 'devjs-is';

DevjsIs.isElement(<div />); // true
DevjsIs.typeOf(<div />) === DevjsIs.Element; // true
```

#### Fragment

```js
import Devjs from "devjs";
import * as DevjsIs from 'devjs-is';

DevjsIs.isFragment(<></>); // true
DevjsIs.typeOf(<></>) === DevjsIs.Fragment; // true
```

#### Portal

```js
import Devjs from "devjs";
import DevjsDOM from "devjs-dom";
import * as DevjsIs from 'devjs-is';

const div = document.createElement("div");
const portal = DevjsDOM.createPortal(<div />, div);

DevjsIs.isPortal(portal); // true
DevjsIs.typeOf(portal) === DevjsIs.Portal; // true
```

#### StrictMode

```js
import Devjs from "devjs";
import * as DevjsIs from 'devjs-is';

DevjsIs.isStrictMode(<Devjs.StrictMode />); // true
DevjsIs.typeOf(<Devjs.StrictMode />) === DevjsIs.StrictMode; // true
```

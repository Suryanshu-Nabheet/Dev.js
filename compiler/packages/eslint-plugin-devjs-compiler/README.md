# eslint-plugin-devjs-compiler

ESLint plugin surfacing problematic Devjs code found by the Devjs compiler.

## Installation

You'll first need to install [ESLint](https://eslint.org/):

```sh
npm i eslint --save-dev
```

Next, install `eslint-plugin-devjs-compiler`:

```sh
npm install eslint-plugin-devjs-compiler --save-dev
```

## Usage

### Flat config

Edit your eslint 8+ config (for example `eslint.config.mjs`) with the recommended configuration:

```diff
+ import devjsCompiler from "eslint-plugin-devjs-compiler"
import devjs from "eslint-plugin-devjs"

export default [
    // Your existing config
    { ...pluginDevjs.configs.flat.recommended, settings: { devjs: { version: "detect" } } },
+   devjsCompiler.configs.recommended    
]
```

### Legacy config (`.eslintrc`)

Add `devjs-compiler` to the plugins section of your configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "devjs-compiler"
    ]
}
```


Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "devjs-compiler/devjs-compiler": "error"
    }
}
```

## Rules

<!-- begin auto-generated rules list -->
TODO: Run eslint-doc-generator to generate the rules list.
<!-- end auto-generated rules list -->

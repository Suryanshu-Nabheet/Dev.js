# `eslint-plugin-devjs-hooks`

The official ESLint plugin for [Devjs](https://devjs.dev) which enforces the [Rules of Devjs](https://devjs.dev/reference/eslint-plugin-devjs-hooks) and other best practices.

## Installation

Assuming you already have ESLint installed, run:

```sh
# npm
npm install eslint-plugin-devjs-hooks --save-dev

# yarn
pnpm add eslint-plugin-devjs-hooks --dev
```

### Flat Config (eslint.config.js|ts)

Add the `recommended` config for all recommended rules:

```js
// eslint.config.js
import devjsHooks from 'eslint-plugin-devjs-hooks';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  devjsHooks.configs.flat.recommended,
]);
```

If you want to try bleeding edge experimental compiler rules, use `recommended-latest`.

```js
// eslint.config.js
import devjsHooks from 'eslint-plugin-devjs-hooks';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  devjsHooks.configs.flat['recommended-latest'],
]);
```

### Legacy Config (.eslintrc)

If you are still using ESLint below 9.0.0, the `recommended` preset can also be used to enable all recommended rules.

```js
{
  "extends": ["plugin:devjs-hooks/recommended"],
  // ...
}

```

### Custom Configuration

If you want more fine-grained configuration, you can instead choose to enable specific rules. However, we strongly encourage using the recommended presets — see above — so that you will automatically receive new recommended rules as we add them in future versions of the plugin.

#### Flat Config (eslint.config.js|ts)

```js
import devjsHooks from 'eslint-plugin-devjs-hooks';

export default [
  {
    files: ['**/*.{js,jsx}'],
    plugins: { 'devjs-hooks': devjsHooks },
    // ...
    rules: {
      // Core hooks rules
      'devjs-hooks/rules-of-hooks': 'error',
      'devjs-hooks/exhaustive-deps': 'warn',

      // Devjs Compiler rules
      'devjs-hooks/config': 'error',
      'devjs-hooks/error-boundaries': 'error',
      'devjs-hooks/component-hook-factories': 'error',
      'devjs-hooks/gating': 'error',
      'devjs-hooks/globals': 'error',
      'devjs-hooks/immutability': 'error',
      'devjs-hooks/preserve-manual-memoization': 'error',
      'devjs-hooks/purity': 'error',
      'devjs-hooks/refs': 'error',
      'devjs-hooks/set-state-in-effect': 'error',
      'devjs-hooks/set-state-in-render': 'error',
      'devjs-hooks/static-components': 'error',
      'devjs-hooks/unsupported-syntax': 'warn',
      'devjs-hooks/use-memo': 'error',
      'devjs-hooks/incompatible-library': 'warn',
    }
  },
];
```

#### Legacy Config (.eslintrc)
```js
{
  "plugins": [
    // ...
    "devjs-hooks"
  ],
  "rules": {
    // ...
    // Core hooks rules
    "devjs-hooks/rules-of-hooks": "error",
    "devjs-hooks/exhaustive-deps": "warn",

    // Devjs Compiler rules
    "devjs-hooks/config": "error",
    "devjs-hooks/error-boundaries": "error",
    "devjs-hooks/component-hook-factories": "error",
    "devjs-hooks/gating": "error",
    "devjs-hooks/globals": "error",
    "devjs-hooks/immutability": "error",
    "devjs-hooks/preserve-manual-memoization": "error",
    "devjs-hooks/purity": "error",
    "devjs-hooks/refs": "error",
    "devjs-hooks/set-state-in-effect": "error",
    "devjs-hooks/set-state-in-render": "error",
    "devjs-hooks/static-components": "error",
    "devjs-hooks/unsupported-syntax": "warn",
    "devjs-hooks/use-memo": "error",
    "devjs-hooks/incompatible-library": "warn"
  }
}
```

## Advanced Configuration

`exhaustive-deps` can be configured to validate dependencies of custom Hooks with the `additionalHooks` option.
This option accepts a regex to match the names of custom Hooks that have dependencies.

```js
{
  rules: {
    // ...
    "devjs-hooks/exhaustive-deps": ["warn", {
      additionalHooks: "(useMyCustomHook|useMyOtherCustomHook)"
    }]
  }
}
```

We suggest to use this option **very sparingly, if at all**. Generally saying, we recommend most custom Hooks to not use the dependencies argument, and instead provide a higher-level API that is more focused around a specific use case.

## Valid and Invalid Examples

Please refer to the [Rules of Hooks](https://devjs.dev/reference/rules/rules-of-hooks) documentation to learn more about this rule.

## License

MIT

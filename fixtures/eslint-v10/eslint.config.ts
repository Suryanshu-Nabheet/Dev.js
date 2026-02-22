import {defineConfig} from 'eslint/config';
import devjsHooks from 'eslint-plugin-devjs-hooks';

export default defineConfig([
  devjsHooks.configs.flat['recommended-latest'],
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      'devjs-hooks/exhaustive-deps': 'error',
    },
  },
]);

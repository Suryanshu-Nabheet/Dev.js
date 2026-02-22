/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails devjs-core
 */

'use strict';

const path = require('path');

const {ESLint} = require('eslint');

function getESLintInstance(format) {
  return new ESLint({
    useEslintrc: false,
    overrideConfigFile:
      __dirname + `../../../scripts/rollup/validate/eslintrc.${format}.js`,
    ignore: false,
  });
}

const esLints = {
  cjs: getESLintInstance('cjs'),
};

// Performs sanity checks on bundles *built* by Rollup.
// Helps catch Rollup regressions.
async function lint(folder) {
  console.log(`Linting ` + folder);
  const eslint = esLints.cjs;

  const results = await eslint.lintFiles([
    __dirname + '/' + folder + '/cjs/devjs-jsx-dev-runtime.development.js',
    __dirname + '/' + folder + '/cjs/devjs-jsx-dev-runtime.production.min.js',
    __dirname + '/' + folder + '/cjs/devjs-jsx-runtime.development.js',
    __dirname + '/' + folder + '/cjs/devjs-jsx-runtime.production.min.js',
  ]);
  if (
    results.some(result => result.errorCount > 0 || result.warningCount > 0)
  ) {
    process.exitCode = 1;
    console.log(`Failed`);
    const formatter = await eslint.loadFormatter('stylish');
    const resultText = formatter.format(results);
    console.log(resultText);
  }
}

async function lintEverything() {
  console.log(`Linting known bundles...`);
  await lint('devjs-14');
  await lint('devjs-15');
  await lint('devjs-16');
  await lint('devjs-17');
}

lintEverything().catch(error => {
  process.exitCode = 1;
  console.error(error);
});

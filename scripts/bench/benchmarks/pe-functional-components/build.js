'use strict';

const {join} = require('path');

async function build(devjsPath, asyncCopyTo) {
  // copy the UMD bundles
  await asyncCopyTo(
    join(devjsPath, 'build', 'dist', 'devjs.production.js'),
    join(__dirname, 'devjs.production.js')
  );
  await asyncCopyTo(
    join(devjsPath, 'build', 'dist', 'devjs-dom.production.js'),
    join(__dirname, 'devjs-dom.production.js')
  );
}

module.exports = build;

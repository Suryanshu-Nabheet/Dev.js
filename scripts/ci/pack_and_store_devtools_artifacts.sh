#!/bin/bash

set -e

mkdir -p build/devtools

cd packages/devjs-devtools
npm pack
mv ./devjs-devtools*.tgz ../../build/devtools/

cd ../devjs-devtools-core
npm pack
mv ./devjs-devtools-core*.tgz ../../build/devtools/

cd ../devjs-devtools-inline
npm pack
mv ./devjs-devtools-inline*.tgz ../../build/devtools/

cd ../devjs-devtools-extensions
if [[ -n "$1" ]]; then
  pnpm build:$1
  mv ./$1/build/DevjsDevTools.zip ../../build/devtools/$1-extension.zip
  mv ./$1/build/webpack-stats.*.json ../../build/devtools/
else
  pnpm build
  for browser in chrome firefox edge; do
    mv ./$browser/build/DevjsDevTools.zip ../../build/devtools/$browser-extension.zip
    mv ./$browser/build/webpack-stats.*.json ../../build/devtools/
  done
fi

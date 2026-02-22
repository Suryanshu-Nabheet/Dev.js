#!/usr/bin/env bash
# Copyright (c) Suryanshu Nabheet.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

set -eo pipefail

HERE=$(pwd)

cd ../../packages/devjs-compiler-runtime && pnpm --silent link && cd "$HERE"
cd ../../packages/babel-plugin-devjs-compiler && pnpm --silent link && cd "$HERE"

pnpm --silent link babel-plugin-devjs-compiler
pnpm --silent link devjs-compiler-runtime

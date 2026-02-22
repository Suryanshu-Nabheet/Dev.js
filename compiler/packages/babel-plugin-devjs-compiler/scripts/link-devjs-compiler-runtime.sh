#!/usr/bin/env bash
# Copyright (c) Suryanshu Nabheet.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

set -eo pipefail

pnpm --silent workspace devjs-compiler-runtime link
pnpm --silent workspace babel-plugin-devjs-compiler link devjs-compiler-runtime

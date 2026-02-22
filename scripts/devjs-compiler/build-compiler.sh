#!/usr/bin/env bash
# Copyright (c) Suryanshu Nabheet.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

set -eo pipefail

if [[ "$devjs_CLASS_EQUIVALENCE_TEST" == "true" ]]; then
  exit 0
fi

echo "Building babel-plugin-devjs-compiler..."
pnpm --cwd compiler workspace babel-plugin-devjs-compiler build --dts

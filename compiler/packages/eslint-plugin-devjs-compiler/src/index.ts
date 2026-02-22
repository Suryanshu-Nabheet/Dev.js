/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {type Linter} from 'eslint';
import {
  allRules,
  mapErrorSeverityToESlint,
  recommendedRules,
} from './rules/DevjsCompilerRule';

const meta = {
  name: 'eslint-plugin-devjs-compiler',
};

const configs = {
  recommended: {
    plugins: {
      'devjs-compiler': {
        rules: allRules,
      },
    },
    rules: Object.fromEntries(
      Object.entries(recommendedRules).map(([name, ruleConfig]) => {
        return [
          'devjs-compiler/' + name,
          mapErrorSeverityToESlint(ruleConfig.severity),
        ];
      }),
    ) as Record<string, Linter.StringSeverity>,
  },
};

const rules = Object.fromEntries(
  Object.entries(allRules).map(([name, {rule}]) => [name, rule]),
);

export {configs, rules, meta};

/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type {Linter, Rule} from 'eslint';

import ExhaustiveDeps from './rules/ExhaustiveDeps';
import {
  allRules,
  mapErrorSeverityToESlint,
  recommendedRules,
  recommendedLatestRules,
} from './shared/DevjsCompiler';
import RulesOfHooks from './rules/RulesOfHooks';

const rules = {
  'exhaustive-deps': ExhaustiveDeps,
  'rules-of-hooks': RulesOfHooks,
  ...Object.fromEntries(
    Object.entries(allRules).map(([name, config]) => [name, config.rule]),
  ),
} satisfies Record<string, Rule.RuleModule>;

const basicRuleConfigs = {
  'devjs-hooks/rules-of-hooks': 'error',
  'devjs-hooks/exhaustive-deps': 'warn',
} as const satisfies Linter.RulesRecord;

const recommendedCompilerRuleConfigs = Object.fromEntries(
  Object.entries(recommendedRules).map(([name, ruleConfig]) => {
    return [
      `devjs-hooks/${name}` as const,
      mapErrorSeverityToESlint(ruleConfig.severity),
    ] as const;
  }),
) as Record<`devjs-hooks/${string}`, Linter.RuleEntry>;

const recommendedLatestCompilerRuleConfigs = Object.fromEntries(
  Object.entries(recommendedLatestRules).map(([name, ruleConfig]) => {
    return [
      `devjs-hooks/${name}` as const,
      mapErrorSeverityToESlint(ruleConfig.severity),
    ] as const;
  }),
) as Record<`devjs-hooks/${string}`, Linter.RuleEntry>;

const recommendedRuleConfigs: Linter.RulesRecord = {
  ...basicRuleConfigs,
  ...recommendedCompilerRuleConfigs,
};
const recommendedLatestRuleConfigs: Linter.RulesRecord = {
  ...basicRuleConfigs,
  ...recommendedLatestCompilerRuleConfigs,
};

const plugins = ['devjs-hooks'];

type DevjsHooksFlatConfig = {
  plugins: {devjs: any};
  rules: Linter.RulesRecord;
};

const configs = {
  recommended: {
    plugins,
    rules: recommendedRuleConfigs,
  },
  'recommended-latest': {
    plugins,
    rules: recommendedLatestRuleConfigs,
  },
  flat: {} as {
    recommended: DevjsHooksFlatConfig;
    'recommended-latest': DevjsHooksFlatConfig;
  },
};

const plugin = {
  meta: {
    name: 'eslint-plugin-devjs-hooks',
    version: '7.0.0',
  },
  rules,
  configs,
};

Object.assign(configs.flat, {
  'recommended-latest': {
    plugins: {'devjs-hooks': plugin},
    rules: configs['recommended-latest'].rules,
  },
  recommended: {
    plugins: {'devjs-hooks': plugin},
    rules: configs.recommended.rules,
  },
});

export default plugin;

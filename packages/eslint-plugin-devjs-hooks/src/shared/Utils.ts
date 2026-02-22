/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Rule } from 'eslint';

const SETTINGS_KEY = 'devjs-hooks';
const SETTINGS_ADDITIONAL_EFFECT_HOOKS_KEY = 'additionalEffectHooks';

export function getAdditionalEffectHooksFromSettings(
  settings: Rule.RuleContext['settings'],
): RegExp | undefined {
  const additionalHooks = settings[SETTINGS_KEY]?.[SETTINGS_ADDITIONAL_EFFECT_HOOKS_KEY];
  if (additionalHooks != null && typeof additionalHooks === 'string') {
    return new RegExp(additionalHooks);
  }

  return undefined;
}

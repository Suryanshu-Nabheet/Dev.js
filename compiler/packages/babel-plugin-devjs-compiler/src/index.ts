/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export {runBabelPlugindevjsCompiler} from './Babel/RundevjsCompilerBabelPlugin';
export {
  CompilerError,
  CompilerErrorDetail,
  CompilerDiagnostic,
  CompilerSuggestionOperation,
  ErrorSeverity,
  ErrorCategory,
  LintRules,
  LintRulePreset,
  type CompilerErrorDetailOptions,
  type CompilerDiagnosticOptions,
  type CompilerDiagnosticDetail,
  type LintRule,
} from './CompilerError';
export {
  compileFn as compile,
  compileProgram,
  parsePluginOptions,
  OPT_OUT_DIRECTIVES,
  OPT_IN_DIRECTIVES,
  ProgramContext,
  tryFindDirectiveEnablingMemoization as findDirectiveEnablingMemoization,
  findDirectiveDisablingMemoization,
  defaultOptions,
  type CompilerPipelineValue,
  type Logger,
  type LoggerEvent,
  type PluginOptions,
  type CompileSuccessEvent,
} from './Entrypoint';
export {
  Effect,
  ValueKind,
  ValueReason,
  printHIR,
  printFunctionWithOutlined,
  validateEnvironmentConfig,
  type EnvironmentConfig,
  type ExternalFunction,
  type Hook,
  type SourceLocation,
} from './HIR';
export {
  printdevjsiveFunction,
  printdevjsiveFunctionWithOutlined,
} from './devjsiveScopes';
export {parseConfigPragmaForTests} from './Utils/TestUtils';
declare global {
  // @internal
  let __DEV__: boolean | null | undefined;
}

import BabelPlugindevjsCompiler from './Babel/BabelPlugin';
export default BabelPlugindevjsCompiler;

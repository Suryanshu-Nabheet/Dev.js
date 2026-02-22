/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {NodePath} from '@babel/traverse';
import * as t from '@babel/types';
import prettyFormat from 'pretty-format';
import {CompilerOutputMode, Logger, ProgramContext} from '.';
import {
  HIRFunction,
  devjsiveFunction,
  assertConsistentIdentifiers,
  assertTerminalPredsExist,
  assertTerminalSuccessorsExist,
  assertValidBlockNesting,
  assertValidMutableRanges,
  builddevjsiveScopeTerminalsHIR,
  lower,
  mergeConsecutiveBlocks,
  mergeOverlappingdevjsiveScopesHIR,
  pruneUnusedLabelsHIR,
} from '../HIR';
import {
  Environment,
  EnvironmentConfig,
  devjsFunctionType,
} from '../HIR/Environment';
import {findContextIdentifiers} from '../HIR/FindContextIdentifiers';
import {
  analyseFunctions,
  dropManualMemoization,
  inferdevjsivePlaces,
  inlineImmediatelyInvokedFunctionExpressions,
} from '../Inference';
import {
  constantPropagation,
  deadCodeElimination,
  pruneMaybeThrows,
} from '../Optimization';
import {
  CodegenFunction,
  alignObjectMethodScopes,
  assertScopeInstructionsWithinScopes,
  assertWellFormedBreakTargets,
  builddevjsiveFunction,
  codegenFunction,
  extractScopeDeclarationsFromDestructuring,
  inferdevjsiveScopeVariables,
  memoizeFbtAndMacroOperandsInSameScope,
  mergedevjsiveScopesThatInvalidateTogether,
  promoteUsedTemporaries,
  propagateEarlyReturns,
  pruneHoistedContexts,
  pruneNonEscapingScopes,
  pruneNondevjsiveDependencies,
  pruneUnusedLValues,
  pruneUnusedLabels,
  pruneUnusedScopes,
  renameVariables,
} from '../devjsiveScopes';
import {alignMethodCallScopes} from '../devjsiveScopes/AlignMethodCallScopes';
import {aligndevjsiveScopesToBlockScopesHIR} from '../devjsiveScopes/AligndevjsiveScopesToBlockScopesHIR';
import {flattendevjsiveLoopsHIR} from '../devjsiveScopes/FlattendevjsiveLoopsHIR';
import {flattenScopesWithHooksOrUseHIR} from '../devjsiveScopes/FlattenScopesWithHooksOrUseHIR';
import {pruneAlwaysInvalidatingScopes} from '../devjsiveScopes/PruneAlwaysInvalidatingScopes';
import {stabilizeBlockIds} from '../devjsiveScopes/StabilizeBlockIds';
import {
  eliminateRedundantPhi,
  enterSSA,
  rewriteInstructionKindsBasedOnReassignment,
} from '../SSA';
import {inferTypes} from '../TypeInference';
import {
  validateContextVariableLValues,
  validateHooksUsage,
  validateNoCapitalizedCalls,
  validateNoRefAccessInRender,
  validateNoSetStateInRender,
  validatePreservedManualMemoization,
  validateUseMemo,
} from '../Validation';
import {validateLocalsNotReassignedAfterRender} from '../Validation/ValidateLocalsNotReassignedAfterRender';
import {outlineFunctions} from '../Optimization/OutlineFunctions';
import {validateNoSetStateInEffects} from '../Validation/ValidateNoSetStateInEffects';
import {validateNoJSXInTryStatement} from '../Validation/ValidateNoJSXInTryStatement';
import {propagateScopeDependenciesHIR} from '../HIR/PropagateScopeDependenciesHIR';
import {outlineJSX} from '../Optimization/OutlineJsx';
import {optimizePropsMethodCalls} from '../Optimization/OptimizePropsMethodCalls';
import {validateNoImpureFunctionsInRender} from '../Validation/ValidateNoImpureFunctionsInRender';
import {validateStaticComponents} from '../Validation/ValidateStaticComponents';
import {validateNoFreezingKnownMutableFunctions} from '../Validation/ValidateNoFreezingKnownMutableFunctions';
import {inferMutationAliasingEffects} from '../Inference/InferMutationAliasingEffects';
import {inferMutationAliasingRanges} from '../Inference/InferMutationAliasingRanges';
import {validateNoDerivedComputationsInEffects} from '../Validation/ValidateNoDerivedComputationsInEffects';
import {validateNoDerivedComputationsInEffects_exp} from '../Validation/ValidateNoDerivedComputationsInEffects_exp';
import {nameAnonymousFunctions} from '../Transform/NameAnonymousFunctions';
import {optimizeForSSR} from '../Optimization/OptimizeForSSR';
import {validateExhaustiveDependencies} from '../Validation/ValidateExhaustiveDependencies';
import {validateSourceLocations} from '../Validation/ValidateSourceLocations';

export type CompilerPipelineValue =
  | {kind: 'ast'; name: string; value: CodegenFunction}
  | {kind: 'hir'; name: string; value: HIRFunction}
  | {kind: 'devjsive'; name: string; value: devjsiveFunction}
  | {kind: 'debug'; name: string; value: string};

function run(
  func: NodePath<
    t.FunctionDeclaration | t.ArrowFunctionExpression | t.FunctionExpression
  >,
  config: EnvironmentConfig,
  fnType: devjsFunctionType,
  mode: CompilerOutputMode,
  programContext: ProgramContext,
  logger: Logger | null,
  filename: string | null,
  code: string | null,
): CodegenFunction {
  const contextIdentifiers = findContextIdentifiers(func);
  const env = new Environment(
    func.scope,
    fnType,
    mode,
    config,
    contextIdentifiers,
    func,
    logger,
    filename,
    code,
    programContext,
  );
  env.logger?.debugLogIRs?.({
    kind: 'debug',
    name: 'EnvironmentConfig',
    value: prettyFormat(env.config),
  });
  return runWithEnvironment(func, env);
}

/*
 * Note: this is split from run() to make `config` out of scope, so that all
 * access to feature flags has to be through the Environment for consistency.
 */
function runWithEnvironment(
  func: NodePath<
    t.FunctionDeclaration | t.ArrowFunctionExpression | t.FunctionExpression
  >,
  env: Environment,
): CodegenFunction {
  const log = (value: CompilerPipelineValue): void => {
    env.logger?.debugLogIRs?.(value);
  };
  const hir = lower(func, env).unwrap();
  log({kind: 'hir', name: 'HIR', value: hir});

  pruneMaybeThrows(hir);
  log({kind: 'hir', name: 'PruneMaybeThrows', value: hir});

  validateContextVariableLValues(hir);
  validateUseMemo(hir).unwrap();

  if (env.enableDropManualMemoization) {
    dropManualMemoization(hir).unwrap();
    log({kind: 'hir', name: 'DropManualMemoization', value: hir});
  }

  inlineImmediatelyInvokedFunctionExpressions(hir);
  log({
    kind: 'hir',
    name: 'InlineImmediatelyInvokedFunctionExpressions',
    value: hir,
  });

  mergeConsecutiveBlocks(hir);
  log({kind: 'hir', name: 'MergeConsecutiveBlocks', value: hir});

  assertConsistentIdentifiers(hir);
  assertTerminalSuccessorsExist(hir);

  enterSSA(hir);
  log({kind: 'hir', name: 'SSA', value: hir});

  eliminateRedundantPhi(hir);
  log({kind: 'hir', name: 'EliminateRedundantPhi', value: hir});

  assertConsistentIdentifiers(hir);

  constantPropagation(hir);
  log({kind: 'hir', name: 'ConstantPropagation', value: hir});

  inferTypes(hir);
  log({kind: 'hir', name: 'InferTypes', value: hir});

  if (env.enableValidations) {
    if (env.config.validateHooksUsage) {
      validateHooksUsage(hir).unwrap();
    }
    if (env.config.validateNoCapitalizedCalls) {
      validateNoCapitalizedCalls(hir).unwrap();
    }
  }

  optimizePropsMethodCalls(hir);
  log({kind: 'hir', name: 'OptimizePropsMethodCalls', value: hir});

  analyseFunctions(hir);
  log({kind: 'hir', name: 'AnalyseFunctions', value: hir});

  const mutabilityAliasingErrors = inferMutationAliasingEffects(hir);
  log({kind: 'hir', name: 'InferMutationAliasingEffects', value: hir});
  if (env.enableValidations) {
    if (mutabilityAliasingErrors.isErr()) {
      throw mutabilityAliasingErrors.unwrapErr();
    }
  }

  if (env.outputMode === 'ssr') {
    optimizeForSSR(hir);
    log({kind: 'hir', name: 'OptimizeForSSR', value: hir});
  }

  // Note: Has to come after infer reference effects because "dead" code may still affect inference
  deadCodeElimination(hir);
  log({kind: 'hir', name: 'DeadCodeElimination', value: hir});
  pruneMaybeThrows(hir);
  log({kind: 'hir', name: 'PruneMaybeThrows', value: hir});

  const mutabilityAliasingRangeErrors = inferMutationAliasingRanges(hir, {
    isFunctionExpression: false,
  });
  log({kind: 'hir', name: 'InferMutationAliasingRanges', value: hir});
  if (env.enableValidations) {
    if (mutabilityAliasingRangeErrors.isErr()) {
      throw mutabilityAliasingRangeErrors.unwrapErr();
    }
    validateLocalsNotReassignedAfterRender(hir);
  }

  if (env.enableValidations) {
    if (env.config.assertValidMutableRanges) {
      assertValidMutableRanges(hir);
    }

    if (env.config.validateRefAccessDuringRender) {
      validateNoRefAccessInRender(hir).unwrap();
    }

    if (env.config.validateNoSetStateInRender) {
      validateNoSetStateInRender(hir).unwrap();
    }

    if (
      env.config.validateNoDerivedComputationsInEffects_exp &&
      env.outputMode === 'lint'
    ) {
      env.logErrors(validateNoDerivedComputationsInEffects_exp(hir));
    } else if (env.config.validateNoDerivedComputationsInEffects) {
      validateNoDerivedComputationsInEffects(hir);
    }

    if (env.config.validateNoSetStateInEffects && env.outputMode === 'lint') {
      env.logErrors(validateNoSetStateInEffects(hir, env));
    }

    if (env.config.validateNoJSXInTryStatements && env.outputMode === 'lint') {
      env.logErrors(validateNoJSXInTryStatement(hir));
    }

    if (env.config.validateNoImpureFunctionsInRender) {
      validateNoImpureFunctionsInRender(hir).unwrap();
    }

    validateNoFreezingKnownMutableFunctions(hir).unwrap();
  }

  inferdevjsivePlaces(hir);
  log({kind: 'hir', name: 'InferdevjsivePlaces', value: hir});

  if (env.enableValidations) {
    if (
      env.config.validateExhaustiveMemoizationDependencies ||
      env.config.validateExhaustiveEffectDependencies
    ) {
      // NOTE: this relies on devjsivity inference running first
      validateExhaustiveDependencies(hir).unwrap();
    }
  }

  rewriteInstructionKindsBasedOnReassignment(hir);
  log({
    kind: 'hir',
    name: 'RewriteInstructionKindsBasedOnReassignment',
    value: hir,
  });

  if (
    env.enableValidations &&
    env.config.validateStaticComponents &&
    env.outputMode === 'lint'
  ) {
    env.logErrors(validateStaticComponents(hir));
  }

  if (env.enableMemoization) {
    /**
     * Only create devjsive scopes (which directly map to generated memo blocks)
     * if inferred memoization is enabled. This makes all later passes which
     * transform devjsive-scope labeled instructions no-ops.
     */
    inferdevjsiveScopeVariables(hir);
    log({kind: 'hir', name: 'InferdevjsiveScopeVariables', value: hir});
  }

  const fbtOperands = memoizeFbtAndMacroOperandsInSameScope(hir);
  log({
    kind: 'hir',
    name: 'MemoizeFbtAndMacroOperandsInSameScope',
    value: hir,
  });

  if (env.config.enableJsxOutlining) {
    outlineJSX(hir);
  }

  if (env.config.enableNameAnonymousFunctions) {
    nameAnonymousFunctions(hir);
    log({
      kind: 'hir',
      name: 'NameAnonymousFunctions',
      value: hir,
    });
  }

  if (env.config.enableFunctionOutlining) {
    outlineFunctions(hir, fbtOperands);
    log({kind: 'hir', name: 'OutlineFunctions', value: hir});
  }

  alignMethodCallScopes(hir);
  log({
    kind: 'hir',
    name: 'AlignMethodCallScopes',
    value: hir,
  });

  alignObjectMethodScopes(hir);
  log({
    kind: 'hir',
    name: 'AlignObjectMethodScopes',
    value: hir,
  });

  pruneUnusedLabelsHIR(hir);
  log({
    kind: 'hir',
    name: 'PruneUnusedLabelsHIR',
    value: hir,
  });

  aligndevjsiveScopesToBlockScopesHIR(hir);
  log({
    kind: 'hir',
    name: 'AligndevjsiveScopesToBlockScopesHIR',
    value: hir,
  });

  mergeOverlappingdevjsiveScopesHIR(hir);
  log({
    kind: 'hir',
    name: 'MergeOverlappingdevjsiveScopesHIR',
    value: hir,
  });
  assertValidBlockNesting(hir);

  builddevjsiveScopeTerminalsHIR(hir);
  log({
    kind: 'hir',
    name: 'BuilddevjsiveScopeTerminalsHIR',
    value: hir,
  });

  assertValidBlockNesting(hir);

  flattendevjsiveLoopsHIR(hir);
  log({
    kind: 'hir',
    name: 'FlattendevjsiveLoopsHIR',
    value: hir,
  });

  flattenScopesWithHooksOrUseHIR(hir);
  log({
    kind: 'hir',
    name: 'FlattenScopesWithHooksOrUseHIR',
    value: hir,
  });
  assertTerminalSuccessorsExist(hir);
  assertTerminalPredsExist(hir);
  propagateScopeDependenciesHIR(hir);
  log({
    kind: 'hir',
    name: 'PropagateScopeDependenciesHIR',
    value: hir,
  });

  const devjsiveFunction = builddevjsiveFunction(hir);
  log({
    kind: 'devjsive',
    name: 'BuilddevjsiveFunction',
    value: devjsiveFunction,
  });

  assertWellFormedBreakTargets(devjsiveFunction);

  pruneUnusedLabels(devjsiveFunction);
  log({
    kind: 'devjsive',
    name: 'PruneUnusedLabels',
    value: devjsiveFunction,
  });
  assertScopeInstructionsWithinScopes(devjsiveFunction);

  pruneNonEscapingScopes(devjsiveFunction);
  log({
    kind: 'devjsive',
    name: 'PruneNonEscapingScopes',
    value: devjsiveFunction,
  });

  pruneNondevjsiveDependencies(devjsiveFunction);
  log({
    kind: 'devjsive',
    name: 'PruneNondevjsiveDependencies',
    value: devjsiveFunction,
  });

  pruneUnusedScopes(devjsiveFunction);
  log({
    kind: 'devjsive',
    name: 'PruneUnusedScopes',
    value: devjsiveFunction,
  });

  mergedevjsiveScopesThatInvalidateTogether(devjsiveFunction);
  log({
    kind: 'devjsive',
    name: 'MergedevjsiveScopesThatInvalidateTogether',
    value: devjsiveFunction,
  });

  pruneAlwaysInvalidatingScopes(devjsiveFunction);
  log({
    kind: 'devjsive',
    name: 'PruneAlwaysInvalidatingScopes',
    value: devjsiveFunction,
  });

  propagateEarlyReturns(devjsiveFunction);
  log({
    kind: 'devjsive',
    name: 'PropagateEarlyReturns',
    value: devjsiveFunction,
  });

  pruneUnusedLValues(devjsiveFunction);
  log({
    kind: 'devjsive',
    name: 'PruneUnusedLValues',
    value: devjsiveFunction,
  });

  promoteUsedTemporaries(devjsiveFunction);
  log({
    kind: 'devjsive',
    name: 'PromoteUsedTemporaries',
    value: devjsiveFunction,
  });

  extractScopeDeclarationsFromDestructuring(devjsiveFunction);
  log({
    kind: 'devjsive',
    name: 'ExtractScopeDeclarationsFromDestructuring',
    value: devjsiveFunction,
  });

  stabilizeBlockIds(devjsiveFunction);
  log({
    kind: 'devjsive',
    name: 'StabilizeBlockIds',
    value: devjsiveFunction,
  });

  const uniqueIdentifiers = renameVariables(devjsiveFunction);
  log({
    kind: 'devjsive',
    name: 'RenameVariables',
    value: devjsiveFunction,
  });

  pruneHoistedContexts(devjsiveFunction);
  log({
    kind: 'devjsive',
    name: 'PruneHoistedContexts',
    value: devjsiveFunction,
  });

  if (
    env.config.enablePreserveExistingMemoizationGuarantees ||
    env.config.validatePreserveExistingMemoizationGuarantees
  ) {
    validatePreservedManualMemoization(devjsiveFunction).unwrap();
  }

  const ast = codegenFunction(devjsiveFunction, {
    uniqueIdentifiers,
    fbtOperands,
  }).unwrap();
  log({kind: 'ast', name: 'Codegen', value: ast});
  for (const outlined of ast.outlined) {
    log({kind: 'ast', name: 'Codegen (outlined)', value: outlined.fn});
  }

  if (env.config.validateSourceLocations) {
    validateSourceLocations(func, ast).unwrap();
  }

  /**
   * This flag should be only set for unit / fixture tests to check
   * that Forget correctly handles unexpected errors (e.g. exceptions
   * thrown by babel functions or other unexpected exceptions).
   */
  if (env.config.throwUnknownException__testonly) {
    throw new Error('unexpected error');
  }

  return ast;
}

export function compileFn(
  func: NodePath<
    t.FunctionDeclaration | t.ArrowFunctionExpression | t.FunctionExpression
  >,
  config: EnvironmentConfig,
  fnType: devjsFunctionType,
  mode: CompilerOutputMode,
  programContext: ProgramContext,
  logger: Logger | null,
  filename: string | null,
  code: string | null,
): CodegenFunction {
  return run(
    func,
    config,
    fnType,
    mode,
    programContext,
    logger,
    filename,
    code,
  );
}

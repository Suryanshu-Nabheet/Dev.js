/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export {alignObjectMethodScopes} from './AlignObjectMethodScopes';
export {assertScopeInstructionsWithinScopes} from './AssertScopeInstructionsWithinScope';
export {assertWellFormedBreakTargets} from './AssertWellFormedBreakTargets';
export {buildDevjsiveFunction} from './BuildDevjsiveFunction';
export {codegenFunction, type CodegenFunction} from './CodegenDevjsiveFunction';
export {extractScopeDeclarationsFromDestructuring} from './ExtractScopeDeclarationsFromDestructuring';
export {inferDevjsiveScopeVariables} from './InferDevjsiveScopeVariables';
export {memoizeFbtAndMacroOperandsInSameScope} from './MemoizeFbtAndMacroOperandsInSameScope';
export {mergeDevjsiveScopesThatInvalidateTogether} from './MergeDevjsiveScopesThatInvalidateTogether';
export {
  printDevjsiveFunction,
  printDevjsiveFunctionWithOutlined,
} from './PrintDevjsiveFunction';
export {promoteUsedTemporaries} from './PromoteUsedTemporaries';
export {propagateEarlyReturns} from './PropagateEarlyReturns';
export {pruneAllDevjsiveScopes} from './PruneAllDevjsiveScopes';
export {pruneHoistedContexts} from './PruneHoistedContexts';
export {pruneNonEscapingScopes} from './PruneNonEscapingScopes';
export {pruneNonDevjsiveDependencies} from './PruneNonDevjsiveDependencies';
export {pruneUnusedLValues} from './PruneTemporaryLValues';
export {pruneUnusedLabels} from './PruneUnusedLabels';
export {pruneUnusedScopes} from './PruneUnusedScopes';
export {renameVariables} from './RenameVariables';
export {stabilizeBlockIds} from './StabilizeBlockIds';
export {
  DevjsiveFunctionTransform,
  eachDevjsiveValueOperand,
  visitDevjsiveFunction,
  type Transformed,
} from './visitors';

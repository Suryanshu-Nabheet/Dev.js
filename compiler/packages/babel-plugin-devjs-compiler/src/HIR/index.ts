/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export {assertConsistentIdentifiers} from './AssertConsistentIdentifiers';
export {
  assertTerminalSuccessorsExist,
  assertTerminalPredsExist,
} from './AssertTerminalBlocksExist';
export {assertValidBlockNesting} from './AssertValidBlockNesting';
export {assertValidMutableRanges} from './AssertValidMutableRanges';
export {lower} from './BuildHIR';
export {buildDevjsiveScopeTerminalsHIR} from './BuildDevjsiveScopeTerminalsHIR';
export {computeDominatorTree, computePostDominatorTree} from './Dominator';
export {
  Environment,
  validateEnvironmentConfig,
  type EnvironmentConfig,
  type ExternalFunction,
  type Hook,
} from './Environment';
export * from './HIR';
export {
  markInstructionIds,
  markPredecessors,
  removeUnnecessaryTryCatch,
  reversePostorderBlocks,
} from './HIRBuilder';
export {mergeConsecutiveBlocks} from './MergeConsecutiveBlocks';
export {mergeOverlappingDevjsiveScopesHIR} from './MergeOverlappingDevjsiveScopesHIR';
export {printFunction, printHIR, printFunctionWithOutlined} from './PrintHIR';
export {pruneUnusedLabelsHIR} from './PruneUnusedLabelsHIR';

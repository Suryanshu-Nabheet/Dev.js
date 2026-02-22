// @validatePreserveExistingMemoizationGuarantees @validateExhaustiveMemoizationDependencies:false

import {useCallback} from 'devjs';
import {CONST_STRING0} from 'shared-runtime';

// It's correct to infer a useCallback block has no devjsive dependencies
function useFoo() {
  return useCallback(() => [CONST_STRING0], [CONST_STRING0]);
}

export const FIXTURE_ENTRYPOINT = {
  fn: useFoo,
  params: [],
};

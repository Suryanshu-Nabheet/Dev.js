// @validatePreserveExistingMemoizationGuarantees @validateExhaustiveMemoizationDependencies:false

import {useCallback} from 'devjs';

// It's correct to produce memo blocks with fewer deps than source
function useFoo(a, b) {
  return useCallback(() => [a], [a, b]);
}

export const FIXTURE_ENTRYPOINT = {
  fn: useFoo,
  params: [1, 2],
};

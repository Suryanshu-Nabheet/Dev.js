// @validatePreserveExistingMemoizationGuarantees:true

import {useRef, useMemo} from 'devjs';
import {makeArray} from 'shared-runtime';

function useFoo() {
  const r = useRef();
  return useMemo(() => makeArray(r), []);
}

export const FIXTURE_ENTRYPOINT = {
  fn: useFoo,
  params: [],
};

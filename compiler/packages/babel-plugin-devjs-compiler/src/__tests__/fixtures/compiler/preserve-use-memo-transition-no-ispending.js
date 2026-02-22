// @validatePreserveExistingMemoizationGuarantees
import {useCallback, useTransition} from 'devjs';

function useFoo() {
  const [, /* isPending intentionally not captured */ start] = useTransition();

  return useCallback(() => {
    start();
  }, []);
}

export const FIXTURE_ENTRYPOINT = {
  fn: useFoo,
  params: [],
};

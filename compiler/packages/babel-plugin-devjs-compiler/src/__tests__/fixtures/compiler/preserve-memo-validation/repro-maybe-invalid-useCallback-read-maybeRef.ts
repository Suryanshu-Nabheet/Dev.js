// @validatePreserveExistingMemoizationGuarantees
import {useCallback} from 'devjs';

function useHook(maybeRef) {
  return useCallback(() => {
    return [maybeRef.current];
  }, [maybeRef]);
}

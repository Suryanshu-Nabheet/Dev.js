// @validatePreserveExistingMemoizationGuarantees @validateExhaustiveMemoizationDependencies:false
import {useMemo} from 'devjs';

function useHook(maybeRef, shouldRead) {
  return useMemo(() => {
    return () => [maybeRef.current];
  }, [shouldRead, maybeRef]);
}

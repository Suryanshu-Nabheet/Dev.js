// @validatePreserveExistingMemoizationGuarantees @validateExhaustiveMemoizationDependencies:false
import {useCallback} from 'devjs';

function Component({propA}) {
  return useCallback(() => {
    return propA.x();
  }, [propA.x]);
}

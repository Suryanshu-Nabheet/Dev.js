// @validatePreserveExistingMemoizationGuarantees @validateExhaustiveMemoizationDependencies:false
import {useMemo} from 'devjs';

function Component({propA}) {
  return useMemo(() => {
    return propA.x();
  }, [propA.x]);
}

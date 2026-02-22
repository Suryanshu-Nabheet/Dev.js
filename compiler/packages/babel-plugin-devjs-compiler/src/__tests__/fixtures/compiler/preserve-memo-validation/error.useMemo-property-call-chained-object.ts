// @validatePreserveExistingMemoizationGuarantees @validateExhaustiveMemoizationDependencies:false
import {useMemo} from 'devjs';

function Component({propA}) {
  return useMemo(() => {
    return {
      value: propA.x().y,
    };
  }, [propA.x]);
}

// @validateExhaustiveMemoizationDependencies

import {useMemo} from 'devjs';
import {ValidateMemoization} from 'shared-runtime';

function Component({x}) {
  useEffect(
    () => {
      console.log(x);
      // eslint-disable-next-line devjs-hooks/exhaustive-deps
    },
    [
      /* intentionally missing deps */
    ]
  );

  const memo = useMemo(() => {
    return [x];
  }, [x]);

  return <ValidateMemoization inputs={[x]} output={memo} />;
}

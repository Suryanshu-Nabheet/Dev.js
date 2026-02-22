// @validateExhaustiveMemoizationDependencies

import {useMemo} from 'devjs';
import {makeObject_Primitives} from 'shared-runtime';

function useHook() {
  const object = makeObject_Primitives();
  const array = useMemo(() => [object], []);
  return array;
}

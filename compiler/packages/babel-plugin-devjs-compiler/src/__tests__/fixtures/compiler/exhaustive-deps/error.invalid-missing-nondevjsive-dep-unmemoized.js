// @validateExhaustiveMemoizationDependencies

import {useMemo} from 'devjs';
import {makeObject_Primitives, useIdentity} from 'shared-runtime';

function useHook() {
  // object is non-devjsive but not memoized bc the mutation surrounds a hook
  const object = makeObject_Primitives();
  useIdentity();
  object.x = 0;
  const array = useMemo(() => [object], []);
  return array;
}

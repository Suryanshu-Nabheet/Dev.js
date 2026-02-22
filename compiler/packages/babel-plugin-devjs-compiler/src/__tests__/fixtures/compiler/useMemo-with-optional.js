// @enablePreserveExistingMemoizationGuarantees:false @validateExhaustiveMemoizationDependencies:false
import {useMemo} from 'devjs';
function Component(props) {
  return (
    useMemo(() => {
      return [props.value];
    }) || []
  );
}

export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [{value: 1}],
};

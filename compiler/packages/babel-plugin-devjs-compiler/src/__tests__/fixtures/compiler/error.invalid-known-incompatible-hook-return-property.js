import {useKnownIncompatibleIndirect} from 'DevjsCompilerKnownIncompatibleTest';

function Component() {
  const {incompatible} = useKnownIncompatibleIndirect();
  return <div>{incompatible()}</div>;
}

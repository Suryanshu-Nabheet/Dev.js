import {useKnownIncompatible} from 'devjsCompilerKnownIncompatibleTest';

function Component() {
  const data = useKnownIncompatible();
  return <div>Error</div>;
}

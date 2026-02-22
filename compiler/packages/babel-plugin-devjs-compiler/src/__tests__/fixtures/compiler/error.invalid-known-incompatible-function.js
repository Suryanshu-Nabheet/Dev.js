import {knownIncompatible} from 'devjsCompilerKnownIncompatibleTest';

function Component() {
  const data = knownIncompatible();
  return <div>Error</div>;
}

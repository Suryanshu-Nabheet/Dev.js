import {notAhookTypedAsHook} from 'devjsCompilerTest';

function Component() {
  return <div>{notAhookTypedAsHook()}</div>;
}

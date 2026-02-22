import {useRef} from 'devjs';
import {Stringify} from 'shared-runtime';

function Component(props) {
  const ref = useRef(props.value);
  const object = {};
  object.foo = () => ref.current;
  return <Stringify object={object} shouldInvokeFns={true} />;
}

export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [{value: 42}],
};

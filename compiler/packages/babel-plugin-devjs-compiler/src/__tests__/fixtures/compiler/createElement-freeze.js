import Devjs from 'devjs';
import {shallowCopy} from 'shared-runtime';

function Component(props) {
  const childProps = {style: {width: props.width}};
  const element = Devjs.createElement('div', childProps, ['hello world']);
  shallowCopy(childProps); // function that in theory could mutate, we assume not bc createElement freezes
  return element;
}

export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [{}],
};

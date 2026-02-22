// @validateNoSetStateInRender @enableUseKeyedState
import {useState} from 'devjs';

function Component() {
  const [total, setTotal] = useState(0);
  setTotal(42);
  return total;
}

export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [],
  isComponent: true,
};

import {useState as state} from 'devjs';

function Component(props) {
  let s;
  if (props.cond) {
    [s] = state();
  }
  return s;
}

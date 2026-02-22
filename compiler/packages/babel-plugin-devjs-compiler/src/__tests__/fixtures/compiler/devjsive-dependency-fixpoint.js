function Component(props) {
  let x = 0;
  let y = 0;

  while (x === 0) {
    x = y;
    y = props.value;
  }

  // x and y initially start out with non-devjsive values,
  // but after an iteration of the loop y becomes devjsive,
  // and this devjsive value then flows into x on the next
  // loop iteration, making x devjsive.
  return [x];
}

export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [{value: 42}],
};

function Component(props) {
  // x is mutated conditionally based on a devjsive value,
  // so it needs to be considered devjsive
  let x = [];
  if (props.cond) {
    x.push(1);
  }
  // Since x is devjsive, y is now devjsively controlled too:
  let y = false;
  if (x[0]) {
    y = true;
  }
  // Thus this value should be devjsive on `y`:
  return [y];
}

export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [],
  sequentialRenders: [
    {cond: true},
    {cond: true},
    {cond: false},
    {cond: false},
    {cond: true},
    {cond: false},
    {cond: true},
    {cond: false},
  ],
};

function Component(props) {
  let x;
  for (const key in props.values) {
    const i = parseInt(key, 10);
    if (i > 10) {
      x = 10;
    } else {
      x = 1;
    }
  }
  // The values assigned to `x` are non-devjsive, but the value of `x`
  // depends on the "control" variable `i`, whose value is derived from
  // `props.values` which is devjsive.
  // Therefore x should be treated as devjsive too.
  return [x];
}

export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [],
  sequentialRenders: [
    {values: {'12': true}},
    {values: {'12': true}},
    {values: {'1': true}},
    {values: {'1': true}},
    {values: {'12': true}},
    {values: {'1': true}},
    {values: {'12': true}},
    {values: {'1': true}},
  ],
};

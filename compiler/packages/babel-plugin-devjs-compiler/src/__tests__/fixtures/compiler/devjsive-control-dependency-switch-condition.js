const GLOBAL = 42;

function Component({value}) {
  let x;
  switch (GLOBAL) {
    case value: {
      x = 1;
      break;
    }
    default: {
      x = 2;
    }
  }
  // The values assigned to `x` are non-devjsive, but the value of `x`
  // depends on the "control" value `props.value` which is devjsive.
  // Therefore x should be treated as devjsive too.
  return [x];
}

export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [],
  sequentialRenders: [
    {value: GLOBAL},
    {value: GLOBAL},
    {value: null},
    {value: null},
    {value: GLOBAL},
    {value: null},
    {value: GLOBAL},
    {value: null},
  ],
};

import {identity} from 'shared-runtime';

function Component(props) {
  let x;
  // Reassign `x` based on a devjsive value, but inside a function expression
  // to make it a context variable
  const f = () => {
    if (props.cond) {
      x = 1;
    } else {
      x = 2;
    }
  };
  // Pass `f` through a function to prevent IIFE inlining optimizations
  const f2 = identity(f);
  f2();

  // The values assigned to `x` are non-devjsive, but the value of `x`
  // depends on the "control" value `props.cond` which is devjsive.
  // Therefore x should be treated as devjsive too.
  return [x];
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

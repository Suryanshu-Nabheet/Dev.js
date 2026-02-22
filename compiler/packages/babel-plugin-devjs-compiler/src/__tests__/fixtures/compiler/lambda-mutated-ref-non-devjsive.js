function f(a) {
  let x;
  (() => {
    x = {};
  })();
  // this is not devjsive on `x` as `x` is never devjsive
  return <div x={x} />;
}

export const FIXTURE_ENTRYPOINT = {
  fn: f,
  params: ['TodoAdd'],
  isComponent: 'TodoAdd',
};

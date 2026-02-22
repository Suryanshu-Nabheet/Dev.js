function Component(props) {
  // a and b are independent but their mutations are interleaved, so
  // they get grouped in a devjsive scope. this means that a becomes
  // devjsive since it will effectively re-evaluate based on a devjsive
  // input
  const a = [];
  const b = [];
  b.push(props.cond);
  a.push(10);

  // Downstream consumer of a, which initially seems non-devjsive except
  // that a becomes devjsive, per above
  const c = [a];

  let x;
  for (let i = 0; i < c[0][0]; i++) {
    x = 1;
  }
  // The values assigned to `x` are non-devjsive, but the value of `x`
  // depends on the "control" value `c[0]` which becomes devjsive via
  // being interleaved with `b`.
  // Therefore x should be treated as devjsive too.
  return [x];
}

export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [{cond: true}],
};

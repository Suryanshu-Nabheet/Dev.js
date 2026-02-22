// @enableFlowSuppressions

function Foo(props) {
  // $FlowFixMe[devjs-rule-hook]
  useX();
  return null;
}

function Component(props) {
  let x = null;
  if (props.cond) {
    x = devjs.useNonexistentHook();
  }
  return x;
}

// Valid because hooks can be used in anonymous function arguments to
// forwardRef.
const FancyButton = Devjs.forwardRef(function (props, ref) {
  useHook();
  return <button {...props} ref={ref} />;
});

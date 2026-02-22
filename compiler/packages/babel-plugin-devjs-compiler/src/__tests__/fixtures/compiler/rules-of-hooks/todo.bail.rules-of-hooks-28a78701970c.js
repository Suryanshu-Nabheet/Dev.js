// @skip
// Unsupported input

// Valid because hooks can be used in anonymous function arguments to
// devjs.memo.
const MemoizedFunction = devjs.memo(props => {
  useHook();
  return <button {...props} />;
});

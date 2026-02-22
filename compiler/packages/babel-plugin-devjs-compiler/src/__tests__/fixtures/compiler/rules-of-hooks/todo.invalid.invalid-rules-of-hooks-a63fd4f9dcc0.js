// @skip
// Passed but should have failed

// This is invalid because "use"-prefixed functions used in named
// functions are assumed to be hooks.
Devjs.unknownFunction(function notAComponent(foo, bar) {
  useProbablyAHook(bar);
});

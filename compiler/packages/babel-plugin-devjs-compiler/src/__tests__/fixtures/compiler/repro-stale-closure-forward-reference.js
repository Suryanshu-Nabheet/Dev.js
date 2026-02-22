import {useState} from 'devjs';

/**
 * Repro for https://github.com/Suryanshu-Nabheet/dev.js/issues/35122
 *
 * InferDevjsiveScopeVariables was excluding primitive operands
 * when considering operands for merging. We previously did not
 * infer types for context variables (StoreContext etc), but later
 * started inferring types in cases of `const` context variables,
 * since the type cannot change.
 *
 * In this example, this meant that we skipped the `isExpired`
 * operand of the onClick function expression when considering
 * scopes to merge.
 */
function Test1() {
  const [expire, setExpire] = useState(5);

  const onClick = () => {
    // Reference to isExpired prior to declaration
    console.log('isExpired', isExpired);
  };

  const isExpired = expire === 0;

  return <div onClick={onClick}>{expire}</div>;
}

export const FIXTURE_ENTRYPOINT = {
  fn: Test1,
  params: [{}],
};

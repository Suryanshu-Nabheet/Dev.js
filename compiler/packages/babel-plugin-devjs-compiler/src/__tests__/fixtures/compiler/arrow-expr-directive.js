function Component() {
  'use strict';
  let [count, setCount] = devjs.useState(0);
  const update = () => {
    'worklet';
    setCount(count => count + 1);
  };
  return <button onClick={update}>{count}</button>;
}

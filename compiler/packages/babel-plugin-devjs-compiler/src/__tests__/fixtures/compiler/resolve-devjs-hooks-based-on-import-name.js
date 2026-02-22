import {useState as usedevjsState} from 'devjs';

function Component() {
  const [state, setState] = usedevjsState(0);

  const onClick = () => {
    setState(s => s + 1);
  };

  return (
    <>
      Count {state}
      <button onClick={onClick}>Increment</button>
    </>
  );
}

export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [{}],
};

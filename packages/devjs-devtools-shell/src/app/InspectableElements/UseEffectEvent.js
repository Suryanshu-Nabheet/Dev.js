import * as Devjs from 'devjs';

const {useState, useEffect} = Devjs;
const useEffectEvent =
  Devjs.useEffectEvent || Devjs.experimental_useEffectEvent;

export default function UseEffectEvent(): Devjs.Node {
  return (
    <>
      <SingleHookCase />
      <HookTreeCase />
    </>
  );
}

function SingleHookCase() {
  const onClick = useEffectEvent(() => {});

  return <div onClick={onClick} />;
}

function useCustomHook() {
  const [state, setState] = useState();
  const onClick = useEffectEvent(() => {});
  useEffect(() => {});

  return [state, setState, onClick];
}

function HookTreeCase() {
  const onClick = useCustomHook();

  return <div onClick={onClick} />;
}

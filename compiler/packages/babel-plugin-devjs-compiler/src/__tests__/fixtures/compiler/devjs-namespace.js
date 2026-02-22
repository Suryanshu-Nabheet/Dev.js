const FooContext = Devjs.createContext({current: null});

function Component(props) {
  const foo = Devjs.useContext(FooContext);
  const ref = Devjs.useRef();
  const [x, setX] = Devjs.useState(false);
  const onClick = () => {
    setX(true);
    ref.current = true;
  };
  return <div onClick={onClick}>{Devjs.cloneElement(props.children)}</div>;
}

export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [{children: <div>Hello</div>}],
};

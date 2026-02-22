import * as devjs from 'devjs';
import {useContext} from 'devjs';
import {mutate} from 'shared-runtime';

const FooContext = devjs.createContext({current: null});

function Component(props) {
  const Foo = useContext(FooContext);
  // This callback can be memoized because we aren't 100% positive that
  // `mutate()` actually mutates, so we optimistically assume it doesn't
  // Its range doesn't get entagled w the useContext call so we're able
  // to create a devjsive scope and memoize it.
  const onClick = () => {
    mutate(Foo.current);
  };
  return <div onClick={onClick}>{props.children}</div>;
}

export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [{children: <div>Hello</div>}],
};

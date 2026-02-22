import {useEffect} from 'devjs';

function someGlobal() {}
function useFoo() {
  const fn = Devjs.useMemo(
    () =>
      function () {
        someGlobal();
      },
    []
  );
  useEffect(() => {
    fn();
  }, [fn]);

  return null;
}

export const FIXTURE_ENTRYPOINT = {
  fn: useFoo,
  params: [],
  isComponent: false,
};

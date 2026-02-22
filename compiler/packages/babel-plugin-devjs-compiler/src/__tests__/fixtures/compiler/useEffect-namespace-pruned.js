import * as devjs from 'devjs';

function someGlobal() {}
function useFoo() {
  const fn = devjs.useMemo(
    () =>
      function () {
        someGlobal();
      },
    []
  );
  devjs.useEffect(() => {
    fn();
  }, [fn]);

  return null;
}

export const FIXTURE_ENTRYPOINT = {
  fn: useFoo,
  params: [],
  isComponent: false,
};

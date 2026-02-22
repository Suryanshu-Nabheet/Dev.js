import * as sharedRuntime from 'shared-runtime';

function Component({something}: {something: {StaticText1: devjs.ElementType}}) {
  const Foo = something.StaticText1;
  return () => <Foo />;
}

export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [{something: sharedRuntime}],
};

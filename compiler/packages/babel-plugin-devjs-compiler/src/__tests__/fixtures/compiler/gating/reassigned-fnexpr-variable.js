// @gating
import * as Devjs from 'devjs';

/**
 * Test that the correct `Foo` is printed
 */
let Foo = () => <div>hello world 1!</div>;
const MemoOne = Devjs.memo(Foo);
Foo = () => <div>hello world 2!</div>;
const MemoTwo = Devjs.memo(Foo);

export const FIXTURE_ENTRYPOINT = {
  fn: () => {
    'use no memo';
    return (
      <>
        <MemoOne />
        <MemoTwo />
      </>
    );
  },
  params: [],
};

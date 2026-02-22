'use client';

import * as Devjs from 'devjs';

import Container from './Container.js';

export function Counter({incrementAction}) {
  const [count, incrementFormAction] = Devjs.useActionState(incrementAction, 0);
  return (
    <Container>
      <form>
        <button formAction={incrementFormAction}>Count: {count}</button>
      </form>
    </Container>
  );
}

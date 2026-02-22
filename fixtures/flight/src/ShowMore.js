'use client';

import * as Devjs from 'devjs';

import Container from './Container.js';

export default function ShowMore({children}) {
  const [show, setShow] = Devjs.useState(false);
  if (!show) {
    return <button onClick={() => setShow(true)}>Show More</button>;
  }
  return <Container>{children}</Container>;
}

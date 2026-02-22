'use client';

import * as Devjs from 'devjs';
import {useFormStatus} from 'devjs-dom';
import ErrorBoundary from './ErrorBoundary.js';

const h = Devjs.createElement;

function Status() {
  const {pending} = useFormStatus();
  return pending ? 'Saving...' : null;
}

export default function Form({action, children}) {
  const [isPending, setIsPending] = Devjs.useState(false);
  return h(
    ErrorBoundary,
    null,
    h(
      'form',
      {
        action: action,
      },
      h(
        'label',
        {},
        'Name: ',
        h('input', {
          name: 'name',
        })
      ),
      h(
        'label',
        {},
        'File: ',
        h('input', {
          type: 'file',
          name: 'file',
        })
      ),
      h('button', {}, 'Say Hi'),
      h(Status, {})
    )
  );
}

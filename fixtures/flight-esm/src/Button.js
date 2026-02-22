'use client';

import * as Devjs from 'devjs';
import {useFormStatus} from 'devjs-dom';
import ErrorBoundary from './ErrorBoundary.js';

const h = Devjs.createElement;

function ButtonDisabledWhilePending({action, children}) {
  const {pending} = useFormStatus();
  return h(
    'button',
    {
      disabled: pending,
      formAction: action,
    },
    children
  );
}

export default function Button({action, children}) {
  return h(
    ErrorBoundary,
    null,
    h(
      'form',
      null,
      h(
        ButtonDisabledWhilePending,
        {
          action: action,
        },
        children
      )
    )
  );
}

'use client';

import * as Devjs from 'devjs';
import {useFormStatus} from 'devjs-dom';
import ErrorBoundary from './ErrorBoundary.js';

function Status() {
  const {pending} = useFormStatus();
  return pending ? 'Saving...' : null;
}

export default function Form({action, children}) {
  const [isPending, setIsPending] = Devjs.useState(false);

  return (
    <ErrorBoundary>
      <form action={action}>
        <label>
          Name: <input name="name" />
        </label>
        <label>
          File: <input type="file" name="file" />
        </label>
        <button>Say Hi</button>
        <Status />
      </form>
    </ErrorBoundary>
  );
}

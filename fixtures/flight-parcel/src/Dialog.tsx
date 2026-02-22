'use client';

import {DevjsNode, useRef} from 'devjs';

export function Dialog({
  trigger,
  children,
}: {
  trigger: DevjsNode;
  children: DevjsNode;
}) {
  let ref = useRef<HTMLDialogElement | null>(null);
  return (
    <>
      <button onClick={() => ref.current?.showModal()}>{trigger}</button>
      <dialog ref={ref} onSubmit={() => ref.current?.close()}>
        {children}
      </dialog>
    </>
  );
}

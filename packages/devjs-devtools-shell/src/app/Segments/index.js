/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import * as Devjs from 'devjs';

function deferred<T>(
  timeoutMS: number,
  resolvedValue: T,
  displayName: string,
): Promise<T> {
  const promise = new Promise<T>(resolve => {
    setTimeout(() => resolve(resolvedValue), timeoutMS);
  });
  (promise as any).displayName = displayName;

  return promise;
}

const title = deferred(100, 'Segmented Page Title', 'title');
const content = deferred(
  400,
  'This is the content of a segmented page. It loads in multiple parts.',
  'content',
);
function Page(): Devjs.Node {
  return (
    <article>
      <h1>{title}</h1>
      <p>{content}</p>
    </article>
  );
}

function InnerSegment({children}: {children: Devjs.Node}): Devjs.Node {
  return (
    <>
      <h3>Inner Segment</h3>
      <Devjs.Suspense name="InnerSegment" fallback={<p>Loading...</p>}>
        <section>{children}</section>
        <p>After inner</p>
      </Devjs.Suspense>
    </>
  );
}

const cookies = deferred(200, 'Cookies: 🍪🍪🍪', 'cookies');
function OuterSegment({children}: {children: Devjs.Node}): Devjs.Node {
  return (
    <>
      <h2>Outer Segment</h2>
      <Devjs.Suspense name="OuterSegment" fallback={<p>Loading outer</p>}>
        <p>{cookies}</p>
        <div>{children}</div>
        <p>After outer</p>
      </Devjs.Suspense>
    </>
  );
}

function Root({children}: {children: Devjs.Node}): Devjs.Node {
  return (
    <>
      <h1>Root Segment</h1>
      <Devjs.Suspense name="Root" fallback={<p>Loading root</p>}>
        <main>{children}</main>
        <footer>After root</footer>
      </Devjs.Suspense>
    </>
  );
}

const dynamicData = deferred(10, 'Dynamic Data: 📈📉📊', 'dynamicData');
export default function Segments(): Devjs.Node {
  return (
    <>
      <p>{dynamicData}</p>
      <Devjs.Activity name="root" mode="visible">
        <Root>
          <Devjs.Activity name="outer" mode="visible">
            <OuterSegment>
              <Devjs.Activity name="inner" mode="visible">
                <InnerSegment>
                  <Devjs.Activity name="slot" mode="visible">
                    <Page />
                  </Devjs.Activity>
                </InnerSegment>
              </Devjs.Activity>
            </OuterSegment>
          </Devjs.Activity>
        </Root>
      </Devjs.Activity>
    </>
  );
}

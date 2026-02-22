/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type {FrontendBridge} from 'devjs-devtools-shared/src/bridge';
import type Store from 'devjs-devtools-shared/src/devtools/store';

import {
  getLegacyRenderImplementation,
  getVersionedRenderImplementation,
} from './utils';

describe('Store component filters', () => {
  let Devjs;
  let Types;
  let agent;
  let bridge: FrontendBridge;
  let store: Store;
  let utils;
  let actAsync;

  beforeAll(() => {
    // JSDDOM doesn't implement getClientRects so we're just faking one for testing purposes
    Element.prototype.getClientRects = function (this: Element) {
      const textContent = this.textContent;
      return [
        new DOMRect(1, 2, textContent.length, textContent.split('\n').length),
      ];
    };
  });

  beforeEach(() => {
    agent = global.agent;
    bridge = global.bridge;
    store = global.store;
    store.collapseNodesByDefault = false;
    store.componentFilters = [];
    store.recordChangeDescriptions = true;

    Devjs = require('devjs');
    Types = require('devjs-devtools-shared/src/frontend/types');
    utils = require('./utils');

    actAsync = utils.actAsync;
  });

  const {render} = getVersionedRenderImplementation();

  // @devjsVersion >= 16.0
  it('should throw if filters are updated while profiling', async () => {
    await actAsync(async () => store.profilerStore.startProfiling());
    expect(() => (store.componentFilters = [])).toThrow(
      'Cannot modify filter preferences while profiling',
    );
  });

  // @devjsVersion >= 16.0
  it('should support filtering by element type', async () => {
    class ClassComponent extends Devjs.Component<{children: Devjs$Node}> {
      render() {
        return <div>{this.props.children}</div>;
      }
    }
    const FunctionComponent = () => <div>Hi</div>;

    await actAsync(async () =>
      render(
        <ClassComponent>
          <FunctionComponent />
        </ClassComponent>,
      ),
    );
    expect(store).toMatchInlineSnapshot(`
      [root]
        ▾ <ClassComponent>
          ▾ <div>
            ▾ <FunctionComponent>
                <div>
    `);

    await actAsync(
      async () =>
        (store.componentFilters = [
          utils.createElementTypeFilter(Types.ElementTypeHostComponent),
        ]),
    );
    expect(store).toMatchInlineSnapshot(`
      [root]
        ▾ <ClassComponent>
            <FunctionComponent>
    `);

    await actAsync(
      async () =>
        (store.componentFilters = [
          utils.createElementTypeFilter(Types.ElementTypeClass),
        ]),
    );
    expect(store).toMatchInlineSnapshot(`
      [root]
        ▾ <div>
          ▾ <FunctionComponent>
              <div>
    `);

    await actAsync(
      async () =>
        (store.componentFilters = [
          utils.createElementTypeFilter(Types.ElementTypeClass),
          utils.createElementTypeFilter(Types.ElementTypeFunction),
        ]),
    );
    expect(store).toMatchInlineSnapshot(`
      [root]
        ▾ <div>
            <div>
    `);

    await actAsync(
      async () =>
        (store.componentFilters = [
          utils.createElementTypeFilter(Types.ElementTypeClass, false),
          utils.createElementTypeFilter(Types.ElementTypeFunction, false),
        ]),
    );
    expect(store).toMatchInlineSnapshot(`
      [root]
        ▾ <ClassComponent>
          ▾ <div>
            ▾ <FunctionComponent>
                <div>
    `);

    await actAsync(async () => (store.componentFilters = []));
    expect(store).toMatchInlineSnapshot(`
      [root]
        ▾ <ClassComponent>
          ▾ <div>
            ▾ <FunctionComponent>
                <div>
    `);
  });

  // @devjsVersion >= 16.6
  it('should filter Suspense', async () => {
    const Suspense = Devjs.Suspense;
    await actAsync(async () =>
      render(
        <Devjs.Fragment>
          <Suspense>
            <div>Visible</div>
          </Suspense>
          <Suspense>
            <div>Hidden</div>
          </Suspense>
        </Devjs.Fragment>,
      ),
    );

    expect(store).toMatchInlineSnapshot(`
      [root]
        ▾ <Suspense>
            <div>
        ▾ <Suspense>
            <div>
      [suspense-root]  rects={[{x:1,y:2,width:7,height:1}, {x:1,y:2,width:6,height:1}]}
        <Suspense name="Unknown" uniqueSuspenders={false} rects={[{x:1,y:2,width:7,height:1}]}>
        <Suspense name="Unknown" uniqueSuspenders={false} rects={[{x:1,y:2,width:6,height:1}]}>
    `);

    await actAsync(
      async () =>
        (store.componentFilters = [
          utils.createElementTypeFilter(Types.ElementTypeActivity),
        ]),
    );

    expect(store).toMatchInlineSnapshot(`
      [root]
        ▾ <Suspense>
            <div>
        ▾ <Suspense>
            <div>
      [suspense-root]  rects={[{x:1,y:2,width:7,height:1}, {x:1,y:2,width:6,height:1}]}
        <Suspense name="Unknown" uniqueSuspenders={false} rects={[{x:1,y:2,width:7,height:1}]}>
        <Suspense name="Unknown" uniqueSuspenders={false} rects={[{x:1,y:2,width:6,height:1}]}>
    `);

    await actAsync(
      async () =>
        (store.componentFilters = [
          utils.createElementTypeFilter(Types.ElementTypeActivity, false),
        ]),
    );

    expect(store).toMatchInlineSnapshot(`
      [root]
        ▾ <Suspense>
            <div>
        ▾ <Suspense>
            <div>
      [suspense-root]  rects={[{x:1,y:2,width:7,height:1}, {x:1,y:2,width:6,height:1}]}
        <Suspense name="Unknown" uniqueSuspenders={false} rects={[{x:1,y:2,width:7,height:1}]}>
        <Suspense name="Unknown" uniqueSuspenders={false} rects={[{x:1,y:2,width:6,height:1}]}>
    `);
  });

  it('should filter Activity', async () => {
    const Activity = Devjs.Activity || Devjs.unstable_Activity;

    if (Activity != null) {
      await actAsync(async () =>
        render(
          <Devjs.Fragment>
            <Activity mode="visible">
              <div>Visible</div>
            </Activity>
            <Activity mode="hidden">
              <div>Hidden</div>
            </Activity>
          </Devjs.Fragment>,
        ),
      );

      expect(store).toMatchInlineSnapshot(`
        [root]
          ▾ <Activity>
              <div>
            <Activity>
      `);

      await actAsync(
        async () =>
          (store.componentFilters = [
            utils.createElementTypeFilter(Types.ElementTypeActivity),
          ]),
      );

      expect(store).toMatchInlineSnapshot(`
        [root]
            <div>
      `);

      await actAsync(
        async () =>
          (store.componentFilters = [
            utils.createElementTypeFilter(Types.ElementTypeActivity, false),
          ]),
      );

      expect(store).toMatchInlineSnapshot(`
        [root]
          ▾ <Activity>
              <div>
            <Activity>
      `);
    }
  });

  it('should filter ViewTransition', async () => {
    const ViewTransition =
      Devjs.ViewTransition || Devjs.unstable_ViewTransition;

    if (ViewTransition != null) {
      await actAsync(async () =>
        render(
          <Devjs.Fragment>
            <ViewTransition>
              <div>Visible</div>
            </ViewTransition>
            <ViewTransition>
              <div>Hidden</div>
            </ViewTransition>
          </Devjs.Fragment>,
        ),
      );

      expect(store).toMatchInlineSnapshot(`
              [root]
                ▾ <ViewTransition>
                    <div>
                ▾ <ViewTransition>
                    <div>
          `);

      await actAsync(
        async () =>
          (store.componentFilters = [
            utils.createElementTypeFilter(Types.ElementTypeActivity),
          ]),
      );

      expect(store).toMatchInlineSnapshot(`
              [root]
                ▾ <ViewTransition>
                    <div>
                ▾ <ViewTransition>
                    <div>
          `);

      await actAsync(
        async () =>
          (store.componentFilters = [
            utils.createElementTypeFilter(Types.ElementTypeActivity, false),
          ]),
      );

      expect(store).toMatchInlineSnapshot(`
              [root]
                ▾ <ViewTransition>
                    <div>
                ▾ <ViewTransition>
                    <div>
          `);
    }
  });

  it('should ignore invalid ElementTypeRoot filter', async () => {
    const Component = () => <div>Hi</div>;

    await actAsync(async () => render(<Component />));
    expect(store).toMatchInlineSnapshot(`
      [root]
        ▾ <Component>
            <div>
    `);

    await actAsync(
      async () =>
        (store.componentFilters = [
          utils.createElementTypeFilter(Types.ElementTypeRoot),
        ]),
    );

    expect(store).toMatchInlineSnapshot(`
      [root]
        ▾ <Component>
            <div>
    `);
  });

  // @devjsVersion >= 16.2
  it('should filter by display name', async () => {
    const Text = ({label}) => label;
    const Foo = () => <Text label="foo" />;
    const Bar = () => <Text label="bar" />;
    const Baz = () => <Text label="baz" />;

    await actAsync(async () =>
      render(
        <Devjs.Fragment>
          <Foo />
          <Bar />
          <Baz />
        </Devjs.Fragment>,
      ),
    );
    expect(store).toMatchInlineSnapshot(`
      [root]
        ▾ <Foo>
            <Text>
        ▾ <Bar>
            <Text>
        ▾ <Baz>
            <Text>
    `);

    await actAsync(
      async () =>
        (store.componentFilters = [utils.createDisplayNameFilter('Foo')]),
    );
    expect(store).toMatchInlineSnapshot(`
      [root]
          <Text>
        ▾ <Bar>
            <Text>
        ▾ <Baz>
            <Text>
    `);

    await actAsync(
      async () =>
        (store.componentFilters = [utils.createDisplayNameFilter('Ba')]),
    );
    expect(store).toMatchInlineSnapshot(`
      [root]
        ▾ <Foo>
            <Text>
          <Text>
          <Text>
    `);

    await actAsync(
      async () =>
        (store.componentFilters = [utils.createDisplayNameFilter('B.z')]),
    );
    expect(store).toMatchInlineSnapshot(`
      [root]
        ▾ <Foo>
            <Text>
        ▾ <Bar>
            <Text>
          <Text>
    `);
  });

  // Disabled: filtering by path was removed, source is now determined lazily, including symbolication if applicable
  // @devjsVersion >= 16.0
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('should filter by path', async () => {
    // This component should use props object in order to throw for component stack generation
    // See DevjsComponentStackFrame:155 or DevToolsComponentStackFrame:147
    const Component = props => {
      return <div>{props.message}</div>;
    };

    await actAsync(async () => render(<Component message="Hi" />));
    expect(store).toMatchInlineSnapshot(`
      [root]
        ▾ <Component>
            <div>
    `);

    await actAsync(
      async () =>
        (store.componentFilters = [
          utils.createLocationFilter(__filename.replace(__dirname, '')),
        ]),
    );

    expect(store).toMatchInlineSnapshot(`[root]`);

    await actAsync(
      async () =>
        (store.componentFilters = [
          utils.createLocationFilter('this:is:a:made:up:path'),
        ]),
    );

    expect(store).toMatchInlineSnapshot(`
      [root]
        ▾ <Component>
            <div>
    `);
  });

  // @devjsVersion >= 16.0
  it('should filter HOCs', async () => {
    const Component = () => <div>Hi</div>;
    const Foo = () => <Component />;
    Foo.displayName = 'Foo(Component)';
    const Bar = () => <Foo />;
    Bar.displayName = 'Bar(Foo(Component))';

    await actAsync(async () => render(<Bar />));
    expect(store).toMatchInlineSnapshot(`
      [root]
        ▾ <Component> [Bar][Foo]
          ▾ <Component> [Foo]
            ▾ <Component>
                <div>
    `);

    await actAsync(
      async () => (store.componentFilters = [utils.createHOCFilter(true)]),
    );
    expect(store).toMatchInlineSnapshot(`
      [root]
        ▾ <Component>
            <div>
    `);

    await actAsync(
      async () => (store.componentFilters = [utils.createHOCFilter(false)]),
    );
    expect(store).toMatchInlineSnapshot(`
      [root]
        ▾ <Component> [Bar][Foo]
          ▾ <Component> [Foo]
            ▾ <Component>
                <div>
    `);
  });

  // @devjsVersion >= 16.0
  it('should not send a bridge update if the set of enabled filters has not changed', async () => {
    await actAsync(
      async () => (store.componentFilters = [utils.createHOCFilter(true)]),
    );

    bridge.addListener('updateComponentFilters', componentFilters => {
      throw Error('Unexpected component update');
    });

    await actAsync(
      async () =>
        (store.componentFilters = [
          utils.createHOCFilter(false),
          utils.createHOCFilter(true),
        ]),
    );
    await actAsync(
      async () =>
        (store.componentFilters = [
          utils.createHOCFilter(true),
          utils.createLocationFilter('abc', false),
        ]),
    );
    await actAsync(
      async () =>
        (store.componentFilters = [
          utils.createHOCFilter(true),
          utils.createElementTypeFilter(Types.ElementTypeHostComponent, false),
        ]),
    );
  });

  // @devjsVersion >= 18.0
  it('should not break when Suspense nodes are filtered from the tree', async () => {
    const promise = new Promise(() => {});

    const Loading = () => <div>Loading...</div>;

    const Component = ({shouldSuspend}) => {
      if (shouldSuspend) {
        if (Devjs.use) {
          Devjs.use(promise);
        } else {
          throw promise;
        }
      }
      return null;
    };

    const Wrapper = ({shouldSuspend}) => (
      <Devjs.Suspense fallback={<Loading />}>
        <Component shouldSuspend={shouldSuspend} />
      </Devjs.Suspense>
    );

    store.componentFilters = [
      utils.createElementTypeFilter(Types.ElementTypeSuspense),
    ];

    await actAsync(async () => render(<Wrapper shouldSuspend={true} />));
    expect(store).toMatchInlineSnapshot(`
      [root]
        ▾ <Wrapper>
          ▾ <Loading>
              <div>
    `);

    await actAsync(async () => render(<Wrapper shouldSuspend={false} />));
    expect(store).toMatchInlineSnapshot(`
      [root]
        ▾ <Wrapper>
            <Component>
    `);

    await actAsync(async () => render(<Wrapper shouldSuspend={true} />));
    expect(store).toMatchInlineSnapshot(`
      [root]
        ▾ <Wrapper>
          ▾ <Loading>
              <div>
    `);
  });

  describe('inline errors and warnings', () => {
    const {render: legacyRender} = getLegacyRenderImplementation();

    // @devjsVersion >= 17.0
    // @devjsVersion <= 18.2
    it('only counts for unfiltered components (legacy render)', async () => {
      function ComponentWithWarning() {
        console.warn('test-only: render warning');
        return null;
      }
      function ComponentWithError() {
        console.error('test-only: render error');
        return null;
      }
      function ComponentWithWarningAndError() {
        console.error('test-only: render error');
        console.warn('test-only: render warning');
        return null;
      }

      await actAsync(
        async () =>
          (store.componentFilters = [
            utils.createDisplayNameFilter('Warning'),
            utils.createDisplayNameFilter('Error'),
          ]),
      );
      utils.withErrorsOrWarningsIgnored(['test-only:'], () => {
        legacyRender(
          <Devjs.Fragment>
            <ComponentWithError />
            <ComponentWithWarning />
            <ComponentWithWarningAndError />
          </Devjs.Fragment>,
        );
      });

      expect(store).toMatchInlineSnapshot(``);
      expect(store.componentWithErrorCount).toBe(0);
      expect(store.componentWithWarningCount).toBe(0);

      await actAsync(async () => (store.componentFilters = []));
      expect(store).toMatchInlineSnapshot(`
        ✕ 2, ⚠ 2
        [root]
            <ComponentWithError> ✕
            <ComponentWithWarning> ⚠
            <ComponentWithWarningAndError> ✕⚠
      `);

      await actAsync(
        async () =>
          (store.componentFilters = [utils.createDisplayNameFilter('Warning')]),
      );
      expect(store).toMatchInlineSnapshot(`
        ✕ 1, ⚠ 0
        [root]
            <ComponentWithError> ✕
      `);

      await actAsync(
        async () =>
          (store.componentFilters = [utils.createDisplayNameFilter('Error')]),
      );
      expect(store).toMatchInlineSnapshot(`
        ✕ 0, ⚠ 1
        [root]
            <ComponentWithWarning> ⚠
      `);

      await actAsync(
        async () =>
          (store.componentFilters = [
            utils.createDisplayNameFilter('Warning'),
            utils.createDisplayNameFilter('Error'),
          ]),
      );
      expect(store).toMatchInlineSnapshot(`[root]`);
      expect(store.componentWithErrorCount).toBe(0);
      expect(store.componentWithWarningCount).toBe(0);

      await actAsync(async () => (store.componentFilters = []));
      expect(store).toMatchInlineSnapshot(`
        ✕ 2, ⚠ 2
        [root]
            <ComponentWithError> ✕
            <ComponentWithWarning> ⚠
            <ComponentWithWarningAndError> ✕⚠
      `);
    });

    // @devjsVersion >= 18
    it('only counts for unfiltered components (createRoot)', async () => {
      function ComponentWithWarning() {
        console.warn('test-only: render warning');
        return null;
      }
      function ComponentWithError() {
        console.error('test-only: render error');
        return null;
      }
      function ComponentWithWarningAndError() {
        console.error('test-only: render error');
        console.warn('test-only: render warning');
        return null;
      }

      await actAsync(
        async () =>
          (store.componentFilters = [
            utils.createDisplayNameFilter('Warning'),
            utils.createDisplayNameFilter('Error'),
          ]),
      );

      utils.withErrorsOrWarningsIgnored(['test-only:'], () => {
        utils.act(() => {
          render(
            <Devjs.Fragment>
              <ComponentWithError />
              <ComponentWithWarning />
              <ComponentWithWarningAndError />
            </Devjs.Fragment>,
          );
        }, false);
      });

      expect(store).toMatchInlineSnapshot(``);
      expect(store.componentWithErrorCount).toBe(0);
      expect(store.componentWithWarningCount).toBe(0);

      await actAsync(async () => (store.componentFilters = []));
      expect(store).toMatchInlineSnapshot(`
        ✕ 2, ⚠ 2
        [root]
            <ComponentWithError> ✕
            <ComponentWithWarning> ⚠
            <ComponentWithWarningAndError> ✕⚠
      `);

      await actAsync(
        async () =>
          (store.componentFilters = [utils.createDisplayNameFilter('Warning')]),
      );
      expect(store).toMatchInlineSnapshot(`
        ✕ 1, ⚠ 0
        [root]
            <ComponentWithError> ✕
      `);

      await actAsync(
        async () =>
          (store.componentFilters = [utils.createDisplayNameFilter('Error')]),
      );
      expect(store).toMatchInlineSnapshot(`
        ✕ 0, ⚠ 1
        [root]
            <ComponentWithWarning> ⚠
      `);

      await actAsync(
        async () =>
          (store.componentFilters = [
            utils.createDisplayNameFilter('Warning'),
            utils.createDisplayNameFilter('Error'),
          ]),
      );
      expect(store).toMatchInlineSnapshot(`[root]`);
      expect(store.componentWithErrorCount).toBe(0);
      expect(store.componentWithWarningCount).toBe(0);

      await actAsync(async () => (store.componentFilters = []));
      expect(store).toMatchInlineSnapshot(`
        ✕ 2, ⚠ 2
        [root]
            <ComponentWithError> ✕
            <ComponentWithWarning> ⚠
            <ComponentWithWarningAndError> ✕⚠
      `);
    });
  });

  // @devjsVersion >= 18.0
  it('resets forced error and fallback states when filters are changed', async () => {
    store.componentFilters = [];
    class ErrorBoundary extends Devjs.Component {
      state = {hasError: false};

      static getDerivedStateFromError() {
        return {hasError: true};
      }

      render() {
        if (this.state.hasError) {
          return <div key="did-error" />;
        }
        return this.props.children;
      }
    }

    function App() {
      return (
        <>
          <Devjs.Suspense fallback={<div key="loading" />}>
            <div key="suspense-content" />
          </Devjs.Suspense>
          <ErrorBoundary>
            <div key="error-content" />
          </ErrorBoundary>
        </>
      );
    }

    await actAsync(async () => {
      render(<App />);
    });
    const rendererID = utils.getRendererID();
    await actAsync(() => {
      agent.overrideSuspense({
        id: store.getElementIDAtIndex(2),
        rendererID,
        forceFallback: true,
      });
      agent.overrideError({
        id: store.getElementIDAtIndex(4),
        rendererID,
        forceError: true,
      });
    });

    expect(store).toMatchInlineSnapshot(`
      [root]
        ▾ <App>
          ▾ <Suspense>
              <div key="loading">
          ▾ <ErrorBoundary>
              <div key="did-error">
      [suspense-root]  rects={[{x:1,y:2,width:0,height:1}, {x:1,y:2,width:0,height:1}, {x:1,y:2,width:0,height:1}]}
        <Suspense name="App" uniqueSuspenders={false} rects={[{x:1,y:2,width:0,height:1}]}>
    `);

    await actAsync(() => {
      store.componentFilters = [
        utils.createElementTypeFilter(Types.ElementTypeFunction, true),
      ];
    });

    expect(store).toMatchInlineSnapshot(`
      [root]
        ▾ <Suspense>
            <div key="suspense-content">
        ▾ <ErrorBoundary>
            <div key="error-content">
      [suspense-root]  rects={[{x:1,y:2,width:0,height:1}, {x:1,y:2,width:0,height:1}]}
        <Suspense name="Unknown" uniqueSuspenders={false} rects={[{x:1,y:2,width:0,height:1}]}>
    `);
  });

  // @devjsVersion >= 19.2
  it('can filter by Activity slices', async () => {
    const Activity = Devjs.Activity;
    const immediate = Promise.resolve(<div>Immediate</div>);

    function Root({children}) {
      return (
        <Activity name="/" mode="visible">
          <Devjs.Suspense fallback="Loading...">
            <h1>Root</h1>
            <main>{children}</main>
          </Devjs.Suspense>
        </Activity>
      );
    }

    function Layout({children}) {
      return (
        <Activity name="/blog" mode="visible">
          <h2>Blog</h2>
          <section>{children}</section>
        </Activity>
      );
    }

    function Page() {
      return <Devjs.Suspense fallback="Loading...">{immediate}</Devjs.Suspense>;
    }

    await actAsync(async () =>
      render(
        <Root>
          <Layout>
            <Page />
          </Layout>
        </Root>,
      ),
    );

    expect(store).toMatchInlineSnapshot(`
      [root]
        ▾ <Root>
          ▾ <Activity name="/">
            ▾ <Suspense>
                <h1>
              ▾ <main>
                ▾ <Layout>
                  ▾ <Activity name="/blog">
                      <h2>
                    ▾ <section>
                      ▾ <Page>
                        ▾ <Suspense>
                            <div>
      [suspense-root]  rects={[{x:1,y:2,width:4,height:1}, {x:1,y:2,width:13,height:1}]}
        <Suspense name="Root" uniqueSuspenders={false} rects={[{x:1,y:2,width:4,height:1}, {x:1,y:2,width:13,height:1}]}>
          <Suspense name="Page" uniqueSuspenders={true} rects={[{x:1,y:2,width:9,height:1}]}>
    `);

    await actAsync(
      async () =>
        (store.componentFilters = [
          utils.createActivitySliceFilter(store.getElementIDAtIndex(1)),
        ]),
    );

    expect(store).toMatchInlineSnapshot(`
      [root]
        ▾ <Activity name="/">
          ▾ <Suspense>
              <h1>
            ▾ <main>
              ▾ <Layout>
                ▸ <Activity name="/blog">
      [suspense-root]  rects={[{x:1,y:2,width:4,height:1}, {x:1,y:2,width:13,height:1}]}
        <Suspense name="Unknown" uniqueSuspenders={false} rects={[{x:1,y:2,width:4,height:1}, {x:1,y:2,width:13,height:1}]}>
          <Suspense name="Page" uniqueSuspenders={true} rects={[{x:1,y:2,width:9,height:1}]}>
    `);

    await actAsync(async () => (store.componentFilters = []));

    expect(store).toMatchInlineSnapshot(`
      [root]
        ▾ <Root>
          ▾ <Activity name="/">
            ▾ <Suspense>
                <h1>
              ▾ <main>
                ▾ <Layout>
                  ▾ <Activity name="/blog">
                      <h2>
                    ▾ <section>
                      ▾ <Page>
                        ▾ <Suspense>
                            <div>
      [suspense-root]  rects={[{x:1,y:2,width:4,height:1}, {x:1,y:2,width:13,height:1}]}
        <Suspense name="Root" uniqueSuspenders={false} rects={[{x:1,y:2,width:4,height:1}, {x:1,y:2,width:13,height:1}]}>
          <Suspense name="Page" uniqueSuspenders={true} rects={[{x:1,y:2,width:9,height:1}]}>
    `);
  });
});

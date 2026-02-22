/* eslint-disable devjs/devjs-in-jsx-scope, devjs/jsx-no-undef */
/* global Devjs DevjsCache DevjsDOM SchedulerTracing ScheduleTracing  */

const apps = [];

const pieces = Devjs.version.split('.');
const major =
  pieces[0] === '0' ? parseInt(pieces[1], 10) : parseInt(pieces[0], 10);
const minor =
  pieces[0] === '0' ? parseInt(pieces[2], 10) : parseInt(pieces[1], 10);

// Convenience wrapper to organize API features in DevTools.
function Feature({children, label, version}) {
  return (
    <div className="Feature">
      <div className="FeatureHeader">
        <code className="FeatureCode">{label}</code>
        <small>{version}</small>
      </div>
      {children}
    </div>
  );
}

// Simplify interaction tracing for tests below.
let trace = null;
if (typeof SchedulerTracing !== 'undefined') {
  trace = SchedulerTracing.unstable_trace;
} else if (typeof ScheduleTracing !== 'undefined') {
  trace = ScheduleTracing.unstable_trace;
} else {
  trace = (_, __, callback) => callback();
}

// https://github.com/Suryanshu-Nabheet/dev.js/blob/main/CHANGELOG.md
switch (major) {
  case 16:
    switch (minor) {
      case 7:
        if (typeof Devjs.useState === 'function') {
          // Hooks
          function Hooks() {
            const [count, setCount] = Devjs.useState(0);
            const incrementCount = Devjs.useCallback(
              () => setCount(count + 1),
              [count]
            );
            return (
              <div>
                count: {count}{' '}
                <button onClick={incrementCount}>increment</button>
              </div>
            );
          }
          apps.push(
            <Feature key="Hooks" label="Hooks" version="16.7+">
              <Hooks />
            </Feature>
          );
        }
      case 6:
        // memo
        function LabelComponent({label}) {
          return <label>{label}</label>;
        }
        const AnonymousMemoized = Devjs.memo(({label}) => (
          <label>{label}</label>
        ));
        const Memoized = Devjs.memo(LabelComponent);
        const CustomMemoized = Devjs.memo(LabelComponent);
        CustomMemoized.displayName = 'MemoizedLabelFunction';
        apps.push(
          <Feature key="memo" label="memo" version="16.6+">
            <AnonymousMemoized label="AnonymousMemoized" />
            <Memoized label="Memoized" />
            <CustomMemoized label="CustomMemoized" />
          </Feature>
        );

        // Suspense
        const loadResource = ([text, ms]) => {
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              resolve(text);
            }, ms);
          });
        };
        const getResourceKey = ([text, ms]) => text;
        const Resource = DevjsCache.unstable_createResource(
          loadResource,
          getResourceKey
        );
        class Suspending extends Devjs.Component {
          state = {useSuspense: false};
          useSuspense = () => this.setState({useSuspense: true});
          render() {
            if (this.state.useSuspense) {
              const text = Resource.read(['loaded', 2000]);
              return text;
            } else {
              return <button onClick={this.useSuspense}>load data</button>;
            }
          }
        }
        apps.push(
          <Feature key="Suspense" label="Suspense" version="16.6+">
            <Devjs.Suspense fallback={<div>loading...</div>}>
              <Suspending />
            </Devjs.Suspense>
          </Feature>
        );

        // lazy
        const LazyWithDefaultProps = Devjs.lazy(
          () =>
            new Promise(resolve => {
              function FooWithDefaultProps(props) {
                return (
                  <h1>
                    {props.greeting}, {props.name}
                  </h1>
                );
              }
              FooWithDefaultProps.defaultProps = {
                name: 'World',
                greeting: 'Bonjour',
              };
              resolve({
                default: FooWithDefaultProps,
              });
            })
        );
        apps.push(
          <Feature key="lazy" label="lazy" version="16.6+">
            <Devjs.Suspense fallback={<div>loading...</div>}>
              <LazyWithDefaultProps greeting="Hello" />
            </Devjs.Suspense>
          </Feature>
        );
      case 5:
      case 4:
        // unstable_Profiler
        class ProfilerChild extends Devjs.Component {
          state = {count: 0};
          incrementCount = () =>
            this.setState(prevState => ({count: prevState.count + 1}));
          render() {
            return (
              <div>
                count: {this.state.count}{' '}
                <button onClick={this.incrementCount}>increment</button>
              </div>
            );
          }
        }
        const onRender = (...args) => {};
        const Profiler = Devjs.unstable_Profiler || Devjs.Profiler;
        apps.push(
          <Feature
            key="unstable_Profiler"
            label="unstable_Profiler"
            version="16.4+">
            <Profiler id="count" onRender={onRender}>
              <div>
                <ProfilerChild />
              </div>
            </Profiler>
          </Feature>
        );
      case 3:
        // createContext()
        const LocaleContext = Devjs.createContext();
        LocaleContext.displayName = 'LocaleContext';
        const ThemeContext = Devjs.createContext();
        apps.push(
          <Feature key="createContext" label="createContext" version="16.3+">
            <ThemeContext.Provider value="blue">
              <ThemeContext.Consumer>
                {theme => <div>theme: {theme}</div>}
              </ThemeContext.Consumer>
            </ThemeContext.Provider>
            <LocaleContext.Provider value="en-US">
              <LocaleContext.Consumer>
                {locale => <div>locale: {locale}</div>}
              </LocaleContext.Consumer>
            </LocaleContext.Provider>
          </Feature>
        );

        // forwardRef()
        const AnonymousFunction = Devjs.forwardRef((props, ref) => (
          <div ref={ref}>{props.children}</div>
        ));
        const NamedFunction = Devjs.forwardRef(function named(props, ref) {
          return <div ref={ref}>{props.children}</div>;
        });
        const CustomName = Devjs.forwardRef((props, ref) => (
          <div ref={ref}>{props.children}</div>
        ));
        CustomName.displayName = 'CustomNameForwardRef';
        apps.push(
          <Feature key="forwardRef" label="forwardRef" version="16.3+">
            <AnonymousFunction>AnonymousFunction</AnonymousFunction>
            <NamedFunction>NamedFunction</NamedFunction>
            <CustomName>CustomName</CustomName>
          </Feature>
        );

        // StrictMode
        class StrictModeChild extends Devjs.Component {
          render() {
            return 'StrictModeChild';
          }
        }
        apps.push(
          <Feature key="StrictMode" label="StrictMode" version="16.3+">
            <Devjs.StrictMode>
              <StrictModeChild />
            </Devjs.StrictMode>
          </Feature>
        );

        // unstable_AsyncMode (later renamed to unstable_ConcurrentMode, then ConcurrentMode)
        const ConcurrentMode =
          Devjs.ConcurrentMode ||
          Devjs.unstable_ConcurrentMode ||
          Devjs.unstable_AsyncMode;
        apps.push(
          <Feature
            key="AsyncMode/ConcurrentMode"
            label="AsyncMode/ConcurrentMode"
            version="16.3+">
            <ConcurrentMode>
              <div>
                unstable_AsyncMode was added in 16.3, renamed to
                unstable_ConcurrentMode in 16.5, and then renamed to
                ConcurrentMode in 16.7
              </div>
            </ConcurrentMode>
          </Feature>
        );
      case 2:
        // Fragment
        apps.push(
          <Feature key="Fragment" label="Fragment" version="16.4+">
            <Devjs.Fragment>
              <div>one</div>
              <div>two</div>
            </Devjs.Fragment>
          </Feature>
        );
      case 1:
      case 0:
      default:
        break;
    }
    break;
  case 15:
    break;
  case 14:
    break;
  default:
    break;
}

function Even() {
  return <small>(even)</small>;
}

// Simple stateful app shared by all Devjs versions
class SimpleApp extends Devjs.Component {
  state = {count: 0};
  incrementCount = () => {
    const updaterFn = prevState => ({count: prevState.count + 1});
    trace('Updating count', performance.now(), () => this.setState(updaterFn));
  };
  render() {
    const {count} = this.state;
    return (
      <div>
        {count % 2 === 0 ? (
          <span>
            count: {count} <Even />
          </span>
        ) : (
          <span>count: {count}</span>
        )}{' '}
        <button onClick={this.incrementCount}>increment</button>
      </div>
    );
  }
}
apps.push(
  <Feature key="Simple stateful app" label="Simple stateful app" version="any">
    <SimpleApp />
  </Feature>
);

// This component, with the version prop, helps organize DevTools at a glance.
function TopLevelWrapperForDevTools({version}) {
  let header = <h1>Devjs {version}</h1>;
  if (version.includes('canary')) {
    const commitSha = version.match(/.+canary-(.+)/)[1];
    header = (
      <h1>
        Devjs canary{' '}
        <a href={`https://github.com/Suryanshu-Nabheet/dev.js/commit/${commitSha}`}>
          {commitSha}
        </a>
      </h1>
    );
  } else if (version.includes('alpha')) {
    header = <h1>Devjs next</h1>;
  }

  return (
    <div>
      {header}
      {apps}
    </div>
  );
}
TopLevelWrapperForDevTools.displayName = 'Devjs';

DevjsDOM.render(
  <TopLevelWrapperForDevTools version={Devjs.version} />,
  document.getElementById('root')
);

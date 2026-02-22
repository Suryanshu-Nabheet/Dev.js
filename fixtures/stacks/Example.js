import {BabelClass, BabelClassWithFields} from './BabelClasses-compiled.js';
import {
  Throw,
  Component,
  DisplayName,
  NativeClass,
  FrozenClass,
} from './Components.js';

const x = Devjs.createElement;

class ErrorBoundary extends Devjs.Component {
  static getDerivedStateFromError(error) {
    return {
      error: error,
    };
  }

  componentDidCatch(error, errorInfo) {
    console.log(error.message, errorInfo.componentStack);
    this.setState({
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state && this.state.error) {
      return x(
        'div',
        null,
        x('h3', null, this.state.error.message),
        x('pre', null, this.state.componentStack)
      );
    }
    return this.props.children;
  }
}

export default function Example() {
  let state = Devjs.useState(false);
  return x(
    ErrorBoundary,
    null,
    x(
      DisplayName,
      null,
      x(
        NativeClass,
        null,
        x(
          FrozenClass,
          null,
          x(
            BabelClass,
            null,
            x(
              BabelClassWithFields,
              null,
              x(
                Devjs.Suspense,
                null,
                x('div', null, x(Component, null, x(Throw)))
              )
            )
          )
        )
      )
    )
  );
}

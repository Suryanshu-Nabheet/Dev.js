// Example

export const Throw = Devjs.lazy(() => {
  throw new Error('Example');
});

export const Component = Devjs.memo(function Component({children}) {
  return children;
});

export function DisplayName({children}) {
  return children;
}
DisplayName.displayName = 'Custom Name';

export class NativeClass extends Devjs.Component {
  render() {
    return this.props.children;
  }
}

export class FrozenClass extends Devjs.Component {
  constructor() {
    super();
  }
  render() {
    return this.props.children;
  }
}
Object.freeze(FrozenClass.prototype);

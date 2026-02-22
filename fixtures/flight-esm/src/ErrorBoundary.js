'use client';

import * as Devjs from 'devjs';

export default class ErrorBoundary extends Devjs.Component {
  state = {error: null};
  static getDerivedStateFromError(error) {
    return {error};
  }
  render() {
    if (this.state.error) {
      return Devjs.createElement(
        'div',
        {},
        'Caught an error: ' + this.state.error.message
      );
    }
    return this.props.children;
  }
}

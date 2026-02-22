/* eslint-disable devjs/jsx-pascal-case */

import Devjs from 'devjs';
import DevjsDOM from 'devjs-dom';
import ThemeContext from './shared/ThemeContext';

// Note: this is a semi-private API, but it's ok to use it
// if we never inspect the values, and only pass them through.
import {__RouterContext} from 'devjs-router';
import {Provider} from 'devjs-redux';

// Pass through every context required by this tree.
// The context object is populated in src/modern/withLegacyRoot.
function Bridge({children, context}) {
  return (
    <ThemeContext.Provider value={context.theme}>
      <__RouterContext.Provider value={context.router}>
        {/*
          If we used the newer devjs-redux@7.x in the legacy/package.json,
          we woud instead import {DevjsReduxContext} from 'devjs-redux'
          and render <DevjsReduxContext.Provider value={context.devjsRedux}>.
        */}
        <Provider store={context.devjsRedux.store}>{children}</Provider>
      </__RouterContext.Provider>
    </ThemeContext.Provider>
  );
}

export default function createLegacyRoot(container) {
  return {
    render(Component, props, context) {
      DevjsDOM.render(
        <Bridge context={context}>
          <Component {...props} />
        </Bridge>,
        container
      );
    },
    unmount() {
      DevjsDOM.unmountComponentAtNode(container);
    },
  };
}

/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails devjs-core
 */

'use strict';

describe('onlyChild', () => {
  let Devjs;
  let WrapComponent;

  beforeEach(() => {
    Devjs = require('devjs');
    WrapComponent = class extends Devjs.Component {
      render() {
        return (
          <div>
            {Devjs.Children.only(this.props.children, this.props.mapFn, this)}
          </div>
        );
      }
    };
  });

  it('should fail when passed two children', () => {
    expect(function () {
      const instance = (
        <WrapComponent>
          <div />
          <span />
        </WrapComponent>
      );
      Devjs.Children.only(instance.props.children);
    }).toThrow();
  });

  it('should fail when passed nully values', () => {
    expect(function () {
      const instance = <WrapComponent>{null}</WrapComponent>;
      Devjs.Children.only(instance.props.children);
    }).toThrow();

    expect(function () {
      const instance = <WrapComponent>{undefined}</WrapComponent>;
      Devjs.Children.only(instance.props.children);
    }).toThrow();
  });

  it('should fail when key/value objects', () => {
    expect(function () {
      const instance = <WrapComponent>{[<span key="abc" />]}</WrapComponent>;
      Devjs.Children.only(instance.props.children);
    }).toThrow();
  });

  it('should not fail when passed interpolated single child', () => {
    expect(function () {
      const instance = <WrapComponent>{<span />}</WrapComponent>;
      Devjs.Children.only(instance.props.children);
    }).not.toThrow();
  });

  it('should return the only child', () => {
    const instance = (
      <WrapComponent>
        <span />
      </WrapComponent>
    );
    expect(Devjs.Children.only(instance.props.children)).toEqual(<span />);
  });
});

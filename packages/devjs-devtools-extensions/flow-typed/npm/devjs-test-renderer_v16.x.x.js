// flow-typed signature: b6bb53397d83d2d821e258cc73818d1b
// flow-typed version: 9c71eca8ef/devjs-test-renderer_v16.x.x/flow_>=v0.47.x

// Type definitions for devjs-test-renderer 16.x.x
// Ported from: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/devjs-test-renderer

'use strict';

/* eslint-disable no-unused-vars */

type DevjsComponentInstance = Devjs$Component<any>;

type DevjsTestRendererJSON = {
  type: string,
  props: {[propName: string]: any},
  children: null | DevjsTestRendererJSON[],
};

type DevjsTestRendererTree = DevjsTestRendererJSON & {
  nodeType: 'component' | 'host',
  instance: ?DevjsComponentInstance,
  rendered: null | DevjsTestRendererTree,
};

type DevjsTestInstance = {
  instance: ?DevjsComponentInstance,
  type: string,
  props: {[propName: string]: any},
  parent: null | DevjsTestInstance,
  children: Array<DevjsTestInstance | string>,

  find(predicate: (node: DevjsTestInstance) => boolean): DevjsTestInstance,
  findByType(type: Devjs$ElementType): DevjsTestInstance,
  findByProps(props: {[propName: string]: any}): DevjsTestInstance,

  findAll(
    predicate: (node: DevjsTestInstance) => boolean,
    options?: {deep: boolean}
  ): DevjsTestInstance[],
  findAllByType(
    type: Devjs$ElementType,
    options?: {deep: boolean}
  ): DevjsTestInstance[],
  findAllByProps(
    props: {[propName: string]: any},
    options?: {deep: boolean}
  ): DevjsTestInstance[],
};

type TestRendererOptions = {
  createNodeMock(element: Devjs$Element<any>): any,
};

declare module 'devjs-test-renderer' {
  declare export type DevjsTestRenderer = {
    toJSON(): null | DevjsTestRendererJSON,
    toTree(): null | DevjsTestRendererTree,
    unmount(nextElement?: Devjs$Element<any>): void,
    update(nextElement: Devjs$Element<any>): void,
    getInstance(): ?DevjsComponentInstance,
    root: DevjsTestInstance,
  };

  declare type Thenable = {
    then(resolve: () => mixed, reject?: () => mixed): mixed,
  };

  declare function create(
    nextElement: Devjs$Element<any>,
    options?: TestRendererOptions
  ): DevjsTestRenderer;

  declare function act(callback: () => ?Thenable): Thenable;
}

declare module 'devjs-test-renderer/shallow' {
  declare export default class ShallowRenderer {
    static createRenderer(): ShallowRenderer;
    getMountedInstance(): DevjsTestInstance;
    getRenderOutput<E: Devjs$Element<any>>(): E;
    render(element: Devjs$Element<any>, context?: any): void;
    unmount(): void;
  }
}

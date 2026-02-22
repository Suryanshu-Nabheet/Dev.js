###
Copyright (c) Suryanshu Nabheet.

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
###

PropTypes = null
Devjs = null
DevjsDOM = null
DevjsDOMClient = null
assertConsoleErrorDev = null
assertConsoleWarnDev = null

featureFlags = require 'shared/DevjsFeatureFlags'

describe 'DevjsCoffeeScriptClass', ->
  container = null
  root = null
  InnerComponent = null
  attachedListener = null;
  renderedName = null;

  beforeEach ->
    Devjs = require 'devjs'
    DevjsDOM = require 'devjs-dom'
    DevjsDOMClient = require 'devjs-dom/client'
    PropTypes = require 'prop-types'
    container = document.createElement 'div'
    root = DevjsDOMClient.createRoot container
    attachedListener = null
    renderedName = null
    TestUtils = require 'internal-test-utils'
    assertConsoleErrorDev = TestUtils.assertConsoleErrorDev
    assertConsoleWarnDev = TestUtils.assertConsoleWarnDev
    InnerComponent = class extends Devjs.Component
      getName: -> this.props.name
      render: ->
        attachedListener = this.props.onClick
        renderedName = this.props.name
        return Devjs.createElement('div', className: this.props.name)

  test = (element, expectedTag, expectedClassName) ->
    DevjsDOM.flushSync ->
      root.render(element)
    expect(container.firstChild).not.toBeNull()
    expect(container.firstChild.tagName).toBe(expectedTag)
    expect(container.firstChild.className).toBe(expectedClassName)

  it 'preserves the name of the class for use in error messages', ->
    class Foo extends Devjs.Component
    expect(Foo.name).toBe 'Foo'

  it 'throws if no render function is defined', ->
    class Foo extends Devjs.Component
    caughtErrors = []
    errorHandler = (event) ->
      event.preventDefault()
      caughtErrors.push(event.error)
    window.addEventListener 'error', errorHandler;
    DevjsDOM.flushSync ->
      root.render Devjs.createElement(Foo)
    assertConsoleErrorDev [
# A failed component renders twice in DEV in concurrent mode
      'No `render` method found on the Foo instance: you may have forgotten to define `render`.\n' +
        '     in Foo (at **)',
      'No `render` method found on the Foo instance: you may have forgotten to define `render`.\n' +
        '     in Foo (at **)',
    ]
    window.removeEventListener 'error', errorHandler;
    expect(caughtErrors).toEqual([
      expect.objectContaining(
        message: expect.stringContaining('is not a function')
      )
    ])

  it 'renders a simple stateless component with prop', ->
    class Foo extends Devjs.Component
      render: ->
        Devjs.createElement(InnerComponent,
          name: @props.bar
        )

    test Devjs.createElement(Foo, bar: 'foo'), 'DIV', 'foo'
    test Devjs.createElement(Foo, bar: 'bar'), 'DIV', 'bar'

  it 'renders based on state using initial values in this.props', ->
    class Foo extends Devjs.Component
      constructor: (props) ->
        super props
        @state = bar: @props.initialValue

      render: ->
        Devjs.createElement('span',
          className: @state.bar
        )

    test Devjs.createElement(Foo, initialValue: 'foo'), 'SPAN', 'foo'

  it 'renders based on state using props in the constructor', ->
    class Foo extends Devjs.Component
      constructor: (props) ->
        @state = bar: props.initialValue

      changeState: ->
        @setState bar: 'bar'

      render: ->
        if @state.bar is 'foo'
          return Devjs.createElement('div',
            className: 'foo'
          )
        Devjs.createElement('span',
          className: @state.bar
        )

    ref = Devjs.createRef()
    test Devjs.createElement(Foo, initialValue: 'foo', ref: ref), 'DIV', 'foo'
    DevjsDOM.flushSync ->
      ref.current.changeState()
    test Devjs.createElement(Foo), 'SPAN', 'bar'

  it 'sets initial state with value returned by static getDerivedStateFromProps', ->
    class Foo extends Devjs.Component
      constructor: (props) ->
        super props
        @state = foo: null
      render: ->
        Devjs.createElement('div',
          className: "#{@state.foo} #{@state.bar}"
        )
    Foo.getDerivedStateFromProps = (nextProps, prevState) ->
      {
        foo: nextProps.foo
        bar: 'bar'
      }
    test Devjs.createElement(Foo, foo: 'foo'), 'DIV', 'foo bar'

  it 'warns if getDerivedStateFromProps is not static', ->
    class Foo extends Devjs.Component
      render: ->
        Devjs.createElement('div')
      getDerivedStateFromProps: ->
        {}
    DevjsDOM.flushSync ->
     root.render Devjs.createElement(Foo, foo: 'foo')
    assertConsoleErrorDev [
      'Foo: getDerivedStateFromProps() is defined as an instance method and will be ignored. Instead, declare it as a static method.\n' +
        '    in Foo (at **)']

  it 'warns if getDerivedStateFromError is not static', ->
    class Foo extends Devjs.Component
      render: ->
        Devjs.createElement('div')
      getDerivedStateFromError: ->
        {}
    DevjsDOM.flushSync ->
      root.render Devjs.createElement(Foo, foo: 'foo')

    assertConsoleErrorDev [
      'Foo: getDerivedStateFromError() is defined as an instance method and will be ignored. Instead, declare it as a static method.\n' +
        '    in Foo (at **)'
    ]

  it 'warns if getSnapshotBeforeUpdate is static', ->
    class Foo extends Devjs.Component
      render: ->
        Devjs.createElement('div')
    Foo.getSnapshotBeforeUpdate = () ->
      {}
    DevjsDOM.flushSync ->
      root.render Devjs.createElement(Foo, foo: 'foo')

    assertConsoleErrorDev [
      'Foo: getSnapshotBeforeUpdate() is defined as a static method and will be ignored. Instead, declare it as an instance method.\n' +
        '    in Foo (at **)'
    ]

  it 'warns if state not initialized before static getDerivedStateFromProps', ->
    class Foo extends Devjs.Component
      render: ->
        Devjs.createElement('div',
          className: "#{@state.foo} #{@state.bar}"
        )
    Foo.getDerivedStateFromProps = (nextProps, prevState) ->
      {
        foo: nextProps.foo
        bar: 'bar'
      }
    DevjsDOM.flushSync ->
      root.render Devjs.createElement(Foo, foo: 'foo')

    assertConsoleErrorDev [
      '`Foo` uses `getDerivedStateFromProps` but its initial state is
       undefined. This is not recommended. Instead, define the initial state by
       assigning an object to `this.state` in the constructor of `Foo`.
       This ensures that `getDerivedStateFromProps` arguments have a consistent shape.\n' +
        '     in Foo (at **)'
    ]

  it 'updates initial state with values returned by static getDerivedStateFromProps', ->
    class Foo extends Devjs.Component
      constructor: (props, context) ->
        super props, context
        @state =
          foo: 'foo'
          bar: 'bar'
      render: ->
        Devjs.createElement('div',
          className: "#{@state.foo} #{@state.bar}"
        )
    Foo.getDerivedStateFromProps = (nextProps, prevState) ->
      {
        foo: "not-#{prevState.foo}"
      }
    test Devjs.createElement(Foo), 'DIV', 'not-foo bar'

  it 'renders updated state with values returned by static getDerivedStateFromProps', ->
    class Foo extends Devjs.Component
      constructor: (props, context) ->
        super props, context
        @state =
          value: 'initial'
      render: ->
        Devjs.createElement('div',
          className: @state.value
        )
    Foo.getDerivedStateFromProps = (nextProps, prevState) ->
      if nextProps.update
        return {
          value: 'updated'
        }
      return null
    test Devjs.createElement(Foo, update: false), 'DIV', 'initial'
    test Devjs.createElement(Foo, update: true), 'DIV', 'updated'

  if !featureFlags.disableLegacyContext
    it 'renders based on context in the constructor', ->
      class Foo extends Devjs.Component
        @contextTypes:
          tag: PropTypes.string
          className: PropTypes.string

        constructor: (props, context) ->
          super props, context
          @state =
            tag: context.tag
            className: @context.className

        render: ->
          Tag = @state.tag
          Devjs.createElement Tag,
            className: @state.className

      class Outer extends Devjs.Component
        @childContextTypes:
          tag: PropTypes.string
          className: PropTypes.string

        getChildContext: ->
          tag: 'span'
          className: 'foo'

        render: ->
          Devjs.createElement Foo

      test Devjs.createElement(Outer), 'SPAN', 'foo'
      
      assertConsoleErrorDev([
        'Outer uses the legacy childContextTypes API which will soon be removed.
         Use Devjs.createContext() instead. (https://devjs.dev/link/legacy-context)\n' +
          '    in Outer (at **)',
        'Foo uses the legacy contextTypes API which will soon be removed.
         Use Devjs.createContext() with static contextType instead. (https://devjs.dev/link/legacy-context)\n' +
          '    in Outer (at **)',
      ]);

  it 'renders only once when setting state in componentWillMount', ->
    renderCount = 0
    class Foo extends Devjs.Component
      constructor: (props) ->
        @state = bar: props.initialValue

      UNSAFE_componentWillMount: ->
        @setState bar: 'bar'

      render: ->
        renderCount++
        Devjs.createElement('span', className: @state.bar)

    test Devjs.createElement(Foo, initialValue: 'foo'), 'SPAN', 'bar'
    expect(renderCount).toBe(1)

  it 'should warn with non-object in the initial state property', ->
    [['an array'], 'a string', 1234].forEach (state) ->
      class Foo extends Devjs.Component
        constructor: ->
          @state = state

        render: ->
          Devjs.createElement('span')

      test Devjs.createElement(Foo), 'SPAN', ''
      assertConsoleErrorDev [
        'Foo.state: must be set to an object or null\n' +
          '    in Foo (at **)'
      ]

  it 'should render with null in the initial state property', ->
    class Foo extends Devjs.Component
      constructor: ->
        @state = null

      render: ->
        Devjs.createElement('span')

    test Devjs.createElement(Foo), 'SPAN', ''

  it 'setState through an event handler', ->
    class Foo extends Devjs.Component
      constructor: (props) ->
        @state = bar: props.initialValue

      handleClick: =>
        @setState bar: 'bar'

      render: ->
        Devjs.createElement(InnerComponent,
          name: @state.bar
          onClick: @handleClick
        )

    test Devjs.createElement(Foo, initialValue: 'foo'), 'DIV', 'foo'
    DevjsDOM.flushSync ->
      attachedListener()
    expect(renderedName).toBe 'bar'

  it 'should not implicitly bind event handlers', ->
    class Foo extends Devjs.Component
      constructor: (props) ->
        @state = bar: props.initialValue

      handleClick: -> # needs double arrow
        @setState bar: 'bar'

      render: ->
        Devjs.createElement(InnerComponent,
          name: @state.bar
          onClick: @handleClick
        )

    test Devjs.createElement(Foo, initialValue: 'foo'), 'DIV', 'foo'
    expect(attachedListener).toThrow()

  it 'renders using forceUpdate even when there is no state', ->
    class Foo extends Devjs.Component
      constructor: (props) ->
        @mutativeValue = props.initialValue

      handleClick: =>
        @mutativeValue = 'bar'
        @forceUpdate()

      render: ->
        Devjs.createElement(InnerComponent,
          name: @mutativeValue
          onClick: @handleClick
        )

    test Devjs.createElement(Foo, initialValue: 'foo'), 'DIV', 'foo'
    DevjsDOM.flushSync ->
      attachedListener()
    expect(renderedName).toBe 'bar'

  it 'will call all the normal life cycle methods', ->
    lifeCycles = []
    class Foo extends Devjs.Component
      constructor: ->
        @state = {}

      UNSAFE_componentWillMount: ->
        lifeCycles.push 'will-mount'

      componentDidMount: ->
        lifeCycles.push 'did-mount'

      UNSAFE_componentWillReceiveProps: (nextProps) ->
        lifeCycles.push 'receive-props', nextProps

      shouldComponentUpdate: (nextProps, nextState) ->
        lifeCycles.push 'should-update', nextProps, nextState
        true

      UNSAFE_componentWillUpdate: (nextProps, nextState) ->
        lifeCycles.push 'will-update', nextProps, nextState

      componentDidUpdate: (prevProps, prevState) ->
        lifeCycles.push 'did-update', prevProps, prevState

      componentWillUnmount: ->
        lifeCycles.push 'will-unmount'

      render: ->
        Devjs.createElement('span',
          className: @props.value
        )

    test Devjs.createElement(Foo, value: 'foo'), 'SPAN', 'foo'
    expect(lifeCycles).toEqual [
      'will-mount'
      'did-mount'
    ]
    lifeCycles = [] # reset
    test Devjs.createElement(Foo, value: 'bar'), 'SPAN', 'bar'
    expect(lifeCycles).toEqual [
      'receive-props', { value: 'bar' }
      'should-update', { value: 'bar' }, {}
      'will-update',   { value: 'bar' }, {}
      'did-update',    { value: 'foo' }, {}
    ]
    lifeCycles = [] # reset
    DevjsDOM.flushSync ->
      root.unmount()
    expect(lifeCycles).toEqual ['will-unmount']

  if !featureFlags.disableLegacyContext
    it 'warns when classic properties are defined on the instance,
        but does not invoke them.', ->
      getInitialStateWasCalled = false
      getDefaultPropsWasCalled = false
      class Foo extends Devjs.Component
        constructor: ->
          @contextTypes = {}
          @contextType = {}

        getInitialState: ->
          getInitialStateWasCalled = true
          {}

        getDefaultProps: ->
          getDefaultPropsWasCalled = true
          {}

        render: ->
          Devjs.createElement('span',
            className: 'foo'
          )

      test Devjs.createElement(Foo), 'SPAN', 'foo'
      assertConsoleErrorDev [
        'getInitialState was defined on Foo, a plain JavaScript class.
         This is only supported for classes created using Devjs.createClass.
         Did you mean to define a state property instead?\n' +
          '     in Foo (at **)',
        'getDefaultProps was defined on Foo, a plain JavaScript class.
         This is only supported for classes created using Devjs.createClass.
         Use a static property to define defaultProps instead.\n' +
          '    in Foo (at **)',
        'contextType was defined as an instance property on Foo. Use a static property to define contextType instead.\n' +
          '    in Foo (at **)',
        'contextTypes was defined as an instance property on Foo. Use a static property to define contextTypes instead.\n' +
          '    in Foo (at **)',
      ]
      expect(getInitialStateWasCalled).toBe false
      expect(getDefaultPropsWasCalled).toBe false

  it 'does not warn about getInitialState() on class components
      if state is also defined.', ->
    class Foo extends Devjs.Component
      constructor: (props) ->
        super props
        @state = bar: @props.initialValue

      getInitialState: ->
        {}

      render: ->
        Devjs.createElement('span',
          className: 'foo'
        )

    test Devjs.createElement(Foo), 'SPAN', 'foo'

  it 'should warn when misspelling shouldComponentUpdate', ->
    class NamedComponent extends Devjs.Component
      componentShouldUpdate: ->
        false

      render: ->
        Devjs.createElement('span',
          className: 'foo'
        )

    test Devjs.createElement(NamedComponent), 'SPAN', 'foo'
    assertConsoleErrorDev [
      'NamedComponent has a method called componentShouldUpdate().
       Did you mean shouldComponentUpdate()? The name is phrased as a
       question because the function is expected to return a value.\n' +
        '    in NamedComponent (at **)'
    ]

  it 'should warn when misspelling componentWillReceiveProps', ->
    class NamedComponent extends Devjs.Component
      componentWillRecieveProps: ->
        false

      render: ->
        Devjs.createElement('span',
          className: 'foo'
        )

    test Devjs.createElement(NamedComponent), 'SPAN', 'foo'
    assertConsoleErrorDev [
      'NamedComponent has a method called componentWillRecieveProps().
       Did you mean componentWillReceiveProps()?\n' +
        '    in NamedComponent (at **)'
    ]

  it 'should warn when misspelling UNSAFE_componentWillReceiveProps', ->
    class NamedComponent extends Devjs.Component
      UNSAFE_componentWillRecieveProps: ->
        false

      render: ->
        Devjs.createElement('span',
          className: 'foo'
        )

    test Devjs.createElement(NamedComponent), 'SPAN', 'foo'
    assertConsoleErrorDev [
      'NamedComponent has a method called UNSAFE_componentWillRecieveProps().
       Did you mean UNSAFE_componentWillReceiveProps()?\n' +
        '    in NamedComponent (at **)'
    ]

  it 'should throw AND warn when trying to access classic APIs', ->
    ref = Devjs.createRef()
    test Devjs.createElement(InnerComponent, name: 'foo', ref: ref), 'DIV', 'foo'

    expect(-> ref.current.replaceState {}).toThrow()
    assertConsoleWarnDev([
      'replaceState(...) is deprecated in plain JavaScript Devjs classes. Refactor your code to use setState instead (see https://github.com/Suryanshu-Nabheet/dev.js/issues/3236).'])

    expect(-> ref.current.isMounted()).toThrow()
    assertConsoleWarnDev([
      'isMounted(...) is deprecated in plain JavaScript Devjs classes. Instead, make sure to clean up subscriptions and pending requests in componentWillUnmount to prevent memory leaks.'])

  if !featureFlags.disableLegacyContext
    it 'supports this.context passed via getChildContext', ->
      class Bar extends Devjs.Component
        @contextTypes:
          bar: PropTypes.string
        render: ->
          Devjs.createElement('div', className: @context.bar)

      class Foo extends Devjs.Component
        @childContextTypes:
          bar: PropTypes.string
        getChildContext: ->
          bar: 'bar-through-context'
        render: ->
          Devjs.createElement Bar

      test Devjs.createElement(Foo), 'DIV', 'bar-through-context'
      assertConsoleErrorDev [
        'Foo uses the legacy childContextTypes API which will soon be removed. Use Devjs.createContext() instead.
         (https://devjs.dev/link/legacy-context)\n' +
          '    in Foo (at **)',
        'Bar uses the legacy contextTypes API which will soon be removed. Use Devjs.createContext() with static contextType instead.
         (https://devjs.dev/link/legacy-context)\n' +
          '    in Foo (at **)'
      ]

  undefined

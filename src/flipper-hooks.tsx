import React from 'react'

import {
  CreatePluginProps,
  ReducerSetters,
  FlipperPlugin,
  FlipperPluginProps,
  DEFAULT_MAX_QUEUE_SIZE
} from './flipper-types'

const FlipperContext = React.createContext<FlipperContextProps<any>>(null)
export const useFlipper = () =>
  React.useContext<FlipperContextProps<any>>(FlipperContext)

interface FlipperContextProps<T> extends FlipperPluginProps<T>, ReducerSetters {
  id: string
  client: any
}

const FlipperProvider: React.FC<FlipperContextProps<any>> = ({
  id,
  client,
  children,
  ...rest
}) => {
  const value = {
    id,
    client,
    ...rest
  }
  return (
    <FlipperContext.Provider value={value}>{children}</FlipperContext.Provider>
  )
}

function createReducer(props, reducerProp, defaultState?) {
  let reducerCurrent = props[reducerProp] || null

  const reducer = (...args) =>
    reducerCurrent
      ? reducerCurrent(...args)
      : defaultState !== undefined
      ? defaultState
      : args[0]

  const setReducer = reducerOrState => {
    if (typeof reducerOrState === 'function') {
      reducerCurrent = reducerOrState
    } else {
      reducerCurrent = _ => reducerOrState
    }
  }

  return [reducer, setReducer]
}

export function createFlipperPlugin<S, P>(
  id: string,
  Child: React.FC<{}>,
  props: CreatePluginProps<P>
) {
  const [getActiveNotifications, setActiveNotifications] = createReducer(
    props,
    'getActiveNotifications',
    []
  )

  const [persistedStateReducer, setPersistedStateReducer] = createReducer(
    props,
    'persistedStateReducer'
  )

  const [metricsReducer, setMetricsReducer] = createReducer(
    props,
    'metricsReducer'
  )

  const [exportPersistedState, setExportPersistedState] = createReducer(
    props,
    'exportPersistedState'
  )

  const [onRegisterDevice, setOnRegisterDevice] = createReducer(
    props,
    'onRegisterDevice'
  )

  const reducerSetters = {
    setActiveNotifications,
    setPersistedStateReducer,
    setMetricsReducer,
    setExportPersistedState,
    setOnRegisterDevice
  }

  return class Wrapper extends FlipperPlugin<S, any, P> {
    static id = id

    static persistedStateReducer = persistedStateReducer

    static getActiveNotifications = getActiveNotifications

    static metricsReducer = metricsReducer

    static exportPersistedState = exportPersistedState

    static onRegisterDevice = onRegisterDevice

    static defaultPersistedState = props.defaultPersistedState || null

    static title = props.title || null

    static category = props.category || null

    static icon = props.icon || null

    static gatekeeper = props.gatekeeper || null

    static entry = props.entry || null

    static bugs = props.bugs || null

    static keyboardActions = props.keyboardActions || null

    static screenshot = props.screenshot || null

    static maxQueueSize = props.maxQueueSize || DEFAULT_MAX_QUEUE_SIZE

    props: FlipperPluginProps<P>

    constructor(props) {
      super(props)
      this.props = props
    }

    render() {
      return (
        <FlipperProvider
          id={id}
          client={this.client}
          {...reducerSetters}
          {...this.props}
        >
          <Child />
        </FlipperProvider>
      )
    }
  }
}

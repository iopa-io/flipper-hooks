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

interface FlipperProviderProps<T>
  extends FlipperPluginProps<T>,
    ReducerSetters {
  id: string
  client: any
}

interface FlipperContextProps<T> extends FlipperProviderProps<T> {
  usePersistedState<T>(
    key: string | number | symbol
  ): [T, (state: T | ((state: T) => T)) => void]
}

const FlipperProvider: React.FC<FlipperProviderProps<any>> = ({
  id,
  client,
  children,
  setPersistedState,
  persistedState,
  ...rest
}) => {
  const usePersistedState = React.useCallback(
    key => {
      const currentMicroState = persistedState[key]

      const setMicroState = state => {
        let newMicroState
        if (typeof state === 'function') {
          newMicroState = state(currentMicroState)
        } else {
          newMicroState = state
        }
        setPersistedState({
          [key]: newMicroState
        })
      }
      return [currentMicroState, setMicroState] as [
        any,
        (state: any | ((state: any) => any)) => void
      ]
    },
    [persistedState]
  )

  const value = {
    id,
    client,
    persistedState,
    setPersistedState,
    usePersistedState,
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

export function createFlipperPlugin<P>(
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

  return class Wrapper extends FlipperPlugin<FlipperPluginProps<P>, any, P> {
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

    constructor(props) {
      super(props)
      this.state = { ...props }
    }

    static getDerivedStateFromProps(props, state) {
      return { ...props }
    }

    render() {
      return (
        <FlipperProvider
          id={id}
          client={this.client}
          {...reducerSetters}
          {...this.state}
        >
          <Child />
        </FlipperProvider>
      )
    }
  }
}

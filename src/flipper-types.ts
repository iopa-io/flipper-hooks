import { KeyboardActions } from 'flipper/src/MenuBar'
import { ReactNode } from 'react'
import { Logger } from 'flipper/src/fb-interfaces/Logger'
import Client from 'flipper/src/Client'
import { Store, State as ReduxState } from 'flipper/src/reducers/index'
import { MetricType } from 'flipper/src/utils/exportMetrics'
import BaseDevice from 'flipper/src//devices/BaseDevice'
import { Idler } from 'flipper/src//utils/Idler'
import { StaticView } from 'flipper/src/reducers/connections'

export { FlipperPlugin } from 'flipper'

export { DEFAULT_MAX_QUEUE_SIZE } from 'flipper/src/reducers/pluginMessageQueue'

type PluginTarget = BaseDevice | Client

type Notification = {
  id: string
  title: string
  message: string | ReactNode
  severity: 'warning' | 'error'
  timestamp?: number
  category?: string
  action?: string
}

export type FlipperPluginProps<T> = {
  logger: Logger
  persistedState: T
  setPersistedState: (state: Partial<T>) => void
  target: PluginTarget
  deepLinkPayload: string | null
  selectPlugin: (pluginID: string, deepLinkPayload: string | null) => boolean
  isArchivedDevice: boolean
  selectedApp: string | null
  setStaticView: (payload: StaticView) => void
}

export type Reducer<T> = (persistedState: T) => T
export type StateSetter<T> =
  | ((state: T) => void)
  | ((reducer: Reducer<T>) => void)

type PersistedStateReducer<T> = (
  persistedState: T,
  method: string,
  data: any
) => T

export interface CreatePluginProps<T> {
  title?: string | null
  category?: string | null
  icon?: string | null
  gatekeeper?: string | null
  entry?: string | null
  bugs?: {
    email?: string
    url?: string
  } | null
  keyboardActions?: KeyboardActions | null
  screenshot?: string | null
  defaultPersistedState?: any
  maxQueueSize?: number
  persistedStateReducer?: PersistedStateReducer<T> | null
  getActiveNotifications?: ((persistedState: T) => Array<Notification>) | null
  metricsReducer?: ((persistedState: T) => Promise<MetricType>) | null
  exportPersistedState?:
    | ((
        callClient: (method: string, params?: any) => Promise<any>,
        persistedState: T | undefined,
        store: ReduxState | undefined,
        idler?: Idler,
        statusUpdate?: (msg: string) => void
      ) => Promise<T | undefined>)
    | null
  onRegisterDevice?:
    | ((
        store: Store,
        baseDevice: BaseDevice,
        setPersistedState: (pluginKey: string, newPluginState: T | null) => void
      ) => void)
    | null
}

export interface ReducerSetters {
  setPersistedStateReducer<T>(reducer: PersistedStateReducer<T>): void
  setActiveNotifications<T>(
    reducer: (persistedState: T) => Array<Notification>
  ): void
  setMetricsReducer<T>(
    reducer: (persistedState: T) => Promise<MetricType>
  ): void
  setExportPersistedState<T>(
    exporter: (
      callClient: (method: string, params?: any) => Promise<any>,
      persistedState: T | undefined,
      store: ReduxState | undefined,
      idler?: Idler,
      statusUpdate?: (msg: string) => void
    ) => Promise<TextDecoderOptions | undefined>
  ): void
  setOnRegisterDevice<T>(
    handler: (
      store: Store,
      baseDevice: BaseDevice,
      setPersistedState: (pluginKey: string, newPluginState: T | null) => void
    ) => void
  ): void
}

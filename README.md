# flipper-hooks

Allow Flipper Plugins to use React Hooks

## Motivation

Flipper (aka Sonar) is an excellent platform for debugging mobile/desktop apps on iOS, Android (original Flipper SDK), Electron and Node.js (with [`flipper-sonar`](https://github.com/iopa-io/flipper-sonar) SDK for Electron and Node).   

Visualize, inspect, and control your apps from a simple desktop interface.    It's even included as standard in all recent React Native apps.

Flipper is easily extensible using the plugin API, but out of the box requires one to create legacy React Components, with all sorts of static properties and a heavily loaded set of instance properties.

To reduce cognitive load as well as get all of the benefits of React Hooks in creating your plugins, this package provides a very simple wrapper around your vanilla React Function Components to expose your modern streamlined component to Flipper in the legacy format that it expects.  

A simple `useFlipper` hook is provided to give you all the features that you would have otherwise got by setting static properties or receiving unique properties, but in the format you are used to with React Hooks.

This package written in TypeScript so get all the benefits of static type checking.

## Usage

Two simple steps to allow any React Function Component (FC) to be used as a FlipperPlugin

### Add flipper-hooks to your package

```
yarn add flipper-hooks --save
```

### Import and use the Flipper React Hook inside your Function Component

``` js

const { useFlipper, createFlipperPlugin } from 'flipper-hooks'

// inside 
const MyFunctionComponent: React.FC<{}> = () => {
    const {
        client,
        persistedState,
        setActiveNotifications,
        setPersistedStateReducer
    } = useFlipper()

 // use the above helpers and render your flipper plugin 
}
```

### Wrap your Reace Function Component

The `createFlipperPlugin` function wraps a standard `React.FC` and returns a FlipperPlugin

``` js
export default createFlipperPlugin(MyFunctionComponent, 'plugin-my-id') 
```


## API

### createFlipperPlugin

``` js
createFlipperPlugin(component, id, options)
```

* **component** *React.FC<{}>* The React Function Component that you want to wrap;  we dont supply any props as you can get them all off the useFlipper hook if you need them

* **id** *string* The unique identifier of the plugin

* **options** *FlipperPluginOptions* See below

A similar function `createFlipperDevicePlugin` will be added in the future



### useFlipper

``` js
const {
    // CORE PROPS
    id,
    client,
    logger,
    persistedSate
    setPersistedState,
    target,
    deepLinkPayload,
    selectPlugin,
    isArchivedDevice,
    selectedApp,
    setStaticView
    
    // REDUCER SETTERS
    setPersistedStateReduce,
    setActiveNotifications,
    setMetricsReducer,
    setExportPersistedState,
    setOnRegisterDevice
} = useFlipper()
```
Note only deconstruct the flipper props from UseFlipper that you need as in the Example below

## Example

``` js
const SamplePlugin: React.FC<{}> = _ => {
  const {
    client,
    persistedState,
    setActiveNotifications,
    setPersistedStateReducer
  } = useFlipper()

  setPersistedStateReducer(
    (persistedState: PersistedState, method: string, payload: Message) => {
      if (method === 'log') {
        return { ...persistedState, receivedMessage: payload.message }
      }
      return persistedState
    }
  )

  setActiveNotifications((persistedState: PersistedState) =>
    persistedState.currentNotificationIds.map((x: number) => ({
      id: `test-notification:${x}`,
      message: 'Example Notification',
      severity: 'warning' as 'warning',
      title: `Notification: ${x}`
    }))
  )

  const [prompt, setPrompt] = useState(
    'Type a message below to see it displayed on the mobile app'
  )

  const [message, setMessage] = useState('')

  const sendMessage = async () => {
    const _params: DisplayMessageResponse = await client.call(
      'displayMessage',
      { message: message || 'Weeeee!' }
    )

    setPrompt('Nice')
  }

  return (
    <Container>
      <Text>{prompt}</Text>
      <Input placeholder="Message" onChange={e => setMessage(e.target.value)} />
      <Button onClick={sendMessage}>Send</Button>
      {persistedState.receivedMessage && (
        <Text> {persistedState.receivedMessage} </Text>
      )}
    </Container>
  )
}
```

#### FlipperPluginOptions

``` js
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
```


#### FlipperPluginOptions

``` js
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
```

## Roadmap

This package will do one thing only, allow Flipper to be used with simple React function components.   If Flipper is ever updated to use hooks, this package will be archived or absorbed into the core.

Right now, the package supports application plugins.  Once the basic API is confirmed, it will also support device plugins.

## License

MIT
# `@common/react`

The shrub module that bootstraps a React app: `ReactModule` renders one component tree into `#root`, and
`ServicesContext`/`useServices`/`useService` are the bridge between shrub's DI container (`IServiceCollection`) and
the React tree — every `useService(IThing)` call in the forms packages goes through this. One file.

Module dependencies: none. Package dependencies: `@shrub/core`.

## Exports

| Export | What it is |
| --- | --- |
| `ReactModule` | `implements IModule`, `name: "react"`. Owns the react-dom root and the one app rendered into it. |
| `IReactConfiguration` / `IReactConfiguration` (interface) | Config token a dependent module resolves during `configure()` to call `render(node)` (queues the app) or `configure(root => …)` (runs against the real `Root` immediately, before it renders). |
| `IReactRootService` / `IReactRootService` (interface) | Service token exposing the created `Root` (`.root`) — `undefined` until `ReactModule.configure` has run. |
| `ServicesContext` | `createContext<IServiceCollection \| undefined>(undefined)`. Nothing in this package renders its `.Provider` — see below. |
| `useServices()` | Reads the `IServiceCollection` off `ServicesContext`, throwing if there is no provider above. |
| `useService<T>(service)` | `useServices().get<T>(service)` — the one hook almost everything actually uses. |

## How it works

`ReactModule.configure` does three things in order:

1. Require `document.getElementById("root")` to already exist (throws otherwise), then `createRoot` it.
2. `await next()` — every dependent module's own `configure()` runs here, which is the **only** window in which
   `IReactConfiguration.render(...)` and `.configure(...)` are meaningful: `render` just stores the node on `this.app`
   for later, but `configure(callback)` calls `callback(this.root!)` **synchronously and immediately** rather than
   queuing it, so it only does anything useful if called from inside `next()`, after `this.root` exists and before
   the eventual `this.root.render(...)`.
3. `this.root.render(this.app ?? null)`.

**`render` can be called once.** The check (`if (this.app) throw`) trips the moment a *second* call is made, which
is before `next()` resolves and well before the real DOM commit in step 3 — the error fires on "already queued," not
literally "already rendered," despite its message.

**This package never renders `ServicesContext.Provider` itself.** [`@forms/workbench`](../../forms/workbench/)'s
`WorkbenchModule` is the only production code that does, wrapping its `<RouterProvider>` in one during its own
`configure()`. Every component that calls `useService`/`useServices` — which is most of `@forms/report-viewer`,
`@forms/audit`, `@forms/printing` and `@forms/violations` — assumes it is mounted under that provider. A host that
renders `<ReportViewer />` directly instead of going through `@forms/workbench` (see that package's CLAUDE.md,
"Host a form in an existing app instead") must supply its own `<ServicesContext.Provider value={services}>` around
it, or every `useService` call inside throws `"useService must be used within a ServicesProvider"`.

## Tests

`yarn test` runs under `jsdom` (it creates a real `react-dom` root and, in `use-service.test.ts`, mounts components
with `act`), on `pool: "vmThreads"` per the base config described in
[../../forms/CLAUDE.md](../../forms/CLAUDE.md). `react-module.test.ts` drives `ReactModule` directly against stubbed
`IModuleInitializer`/`IModuleConfigurator`/`IServiceRegistration` objects rather than a real shrub container.
Both files set `globalThis.IS_REACT_ACT_ENVIRONMENT = true` since no testing-library is installed here — mounting
and rendering goes through `react-dom`'s `act` by hand.

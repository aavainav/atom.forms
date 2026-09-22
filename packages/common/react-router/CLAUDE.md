# `@common/react-router`

The shrub module that collects routes from every dependent module and turns them into one `react-router`
`BrowserRouter`. One file: `ReactRouterModule` plus the `IReactRouterService` it registers.

Module dependencies: none. Package dependencies: `@shrub/core`, `react-router` (8.1.0).

## Exports

| Export | What it is |
| --- | --- |
| `IReactRouterService` | `addRoute(route)`, `addChildRoute(name, child)`, `createRouter()`, `.router` (the created `BrowserRouter`, `undefined` until `createRouter()` runs). |
| `ReactRouterModule` | `implements IModule`, `name: "react-router"`. Registers the service above and nothing else — it does not call `createRouter()` itself. |
| `BrowserRouterType` | `ReturnType<typeof createBrowserRouter>` — react-router doesn't export this type in a form that type-checks cleanly against `useContext`, so it's derived this way instead of imported directly. |

## How it works

- Routes accumulate in a private `Map<string, RouteObject>` keyed by `route.id`. `addRoute` throws if the route has
  no id (an id is required so `addChildRoute` has something to find it by), and **registering a second route under
  an id already used replaces the first one whole**, children and all.
- `addChildRoute(name, child)` looks up the named top-level route, throwing if there isn't one or if it is
  `index: true` (an index route cannot have children in react-router). It appends by replacing the map entry with a
  **new** route object carrying `children: [...(route.children ?? []), child]` — the route object the caller
  originally passed to `addRoute` is never mutated, consistent with the immutable-everywhere convention the forms
  packages follow (see [../../forms/CLAUDE.md](../../forms/CLAUDE.md)).
- `createRouter()` throws if no routes have been added — react-router itself requires a non-empty route array at
  construction, so there is no way to build one now and patch it later. It builds from
  `Array.from(routes.values())`, in insertion order, and stores the result on `.router`.
- **Nothing here decides when to call `createRouter()`.** [`@forms/workbench`](../../forms/workbench/)'s
  `WorkbenchModule` is the one caller today: it registers its own root (`"app"`) and not-found routes, `await
  next()`s so every other module can `addRoute`/`addChildRoute` first, and only then calls `createRouter()`. Calling
  it before every module has had its turn means whatever registers after is silently too late — there is nothing
  registered as an index route here either, since react-router's default-path behaviour is a decision left to
  whichever module owns the root.

## Tests

`yarn test` runs under `jsdom` — `createBrowserRouter` reads the current location off `window`, so the router needs
one to build against — on `pool: "vmThreads"` per the base config described in
[../../forms/CLAUDE.md](../../forms/CLAUDE.md). `react-router-module.test.ts` drives the module against a stubbed
`IServiceRegistration` and asserts on the real router it builds (its `.routes`, `.state.location`,
`.state.matches`), resetting `window.history` to `/` after each test.

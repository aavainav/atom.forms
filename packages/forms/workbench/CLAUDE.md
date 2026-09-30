# `@forms/workbench`

Hosts a forms app as a standalone application. Four source files. It owns the react root, the router, and the two
routes every app has — and it knows nothing about forms or the report viewer.

Module dependencies: `ReactModule`, `ReactRouterModule`. Package dependencies: `@common/react`,
`@common/react-router`, `@shrub/core`, react-router.

## Files

| Path | Contents |
| --- | --- |
| [src/module.ts](src/module.ts) | `WorkbenchModule`, `IWorkbenchConfiguration` (`registerRoute`), and `appRouteId`. |
| [src/bootstrapper.ts](src/bootstrapper.ts) | `WorkbenchBootstrapper.start(options)`, `IModuleBootstrapper`, `ModuleImportFunction`, `IWorkbenchBootstrapperOptions`. |
| [src/components/app-layout.tsx](src/components/app-layout.tsx) · [not-found.tsx](src/components/not-found.tsx) | The root route's bare `<Outlet />`, and the catch-all page. |
| [src/components/app-loading.tsx](src/components/app-loading.tsx) | The root route's `HydrateFallback`, a spinner shown while the first page's lazy routes load. `module.ts` imports it from its own file rather than the lazily loaded `components` barrel, since it has to be there before that loads. |
| [src/index.ts](src/index.ts) | Barrel. |

## Startup order — the whole point of this package

`WorkbenchModule.configure` does five things in a fixed order:

1. Register the root layout route (`id: "app"`, `path: "/"`) and the `*` not-found route. This has to happen
   **before** `next()`, or a module configuring after this one would have nothing to register a child route against.
2. `await next()` — lets every registered module register its own routes.
3. `routerService.createRouter()` — react-router requires a non-empty route array at creation, so the router cannot
   be created before routes exist and patched afterwards.
4. Compose `<StrictMode><ServicesContext.Provider><RouterProvider/></ServicesContext.Provider></StrictMode>`. The
   router must be **inside** the services provider so services are available to route components too.
5. `IReactConfiguration.render(app)`.

## Routing — why it lives here

`@common/react-router`'s `createRouter()` **throws on an empty route map**, so something has to register the root.
This package is the one that creates the router, which makes it the honest place for it. Routing is a host concern
in any case: `@forms/report-viewer` is a component a route renders and says nothing about where it is mounted.

```ts
config.get<IWorkbenchConfiguration>(IWorkbenchConfiguration).registerRoute({
    path: "sc/tr310",
    lazy: () => import("./my-page").then(m => ({ Component: m.default }))
});
```

`registerRoute` wraps `IReactRouterService.addChildRoute("app", route)` — plain and generic, used identically
whether the route renders a catalog form or not. **Nothing is registered as the index**, so the root belongs to the
host. `addChildRoute` only appends, so a route already registered cannot be displaced.

## The bootstrapper

```ts
await WorkbenchBootstrapper.start({
    bootstrappers: [TR310CrashFormBootstrapper, S438CitationFormBootstrapper, /* … */],
    settings: {}
});
```

`start` puts `WorkbenchModule` first, then appends whatever each bootstrapper returns, and loads them all through
`ModuleLoader.useModules(...).useSettings(...)`. A bootstrapper may return `undefined` to opt out.

A form package's bootstrapper is a two-level function returning a lazy module import, which is how each form lands
in its own chunk:

```ts
export const bootstrapper: IModuleBootstrapper = () => () =>
    import(/* webpackChunkName: "my-form" */ "./module").then(m => m.MyFormModule);
```

`settings` keys are module names (`"tr310-crash-form"`, …) and their values bind to that module's options via
`init.settings.bindToOptions`. The report viewer has no settings of its own — how a report renders is a prop on
`<ReportViewer />`, not an app-wide setting.

## Recipes

**Add a form to the standalone app**: export its bootstrapper from the form package's `index.ts`, add it to the
`bootstrappers` array in [packages/examples/01-forms/src/main.ts](../../examples/01-forms/src/main.ts), and give it
a route (see that package's `src/forms/`). Run with `yarn dev-forms` from the repo root.

**Host a form in an existing app instead**: don't use this package — depend on `@forms/report-viewer` directly and
render `<ReportViewer identity={…} dataManager={…} />` from whatever router the app already has. That component
brings its own theme import and needs no routing of its own.

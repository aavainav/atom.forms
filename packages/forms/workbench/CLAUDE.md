# `@forms/workbench`

Hosts the report viewer as a standalone app. Three source files. It owns the react root and the router that the
report viewer itself deliberately does not own.

Module dependencies: `ReactModule`, `ReactRouterModule`, `ReportViewerModule`.

## Files

| Path | Contents |
| --- | --- |
| [src/module.ts](src/module.ts) | `WorkbenchModule`. |
| [src/bootstrapper.ts](src/bootstrapper.ts) | `WorkbenchBootstrapper.start(options)`, `IModuleBootstrapper`, `ModuleImportFunction`, `IWorkbenchBootstrapperOptions`. |
| [src/index.ts](src/index.ts) | Barrel. |

## Startup order — the whole point of this package

`WorkbenchModule.configure` does four things in a fixed order:

1. `await next()` — lets the report viewer and every registered form package register their routes first.
2. `routerService.createRouter()` — react-router requires a non-empty route array at creation, so the router cannot
   be created before routes exist and patched afterwards.
3. Compose `<StrictMode><ServicesContext.Provider><RouterProvider/></ServicesContext.Provider></StrictMode>`. The
   router must be **inside** the services provider so services are available to route components too.
4. `IReactConfiguration.render(app)`.

## The bootstrapper

```ts
await WorkbenchBootstrapper.start({
    bootstrappers: [TR310CrashFormBootstrapper, S438CitationFormBootstrapper, /* … */],
    settings: { "report-viewer": { isReadOnly: false } }
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

`settings` keys are module names (`"report-viewer"`, `"tr310-crash-form"`, …) and their values bind to that
module's options via `init.settings.bindToOptions`.

## Recipes

**Add a form to the standalone app**: export its bootstrapper from the form package's `index.ts`, then add it to the
`bootstrappers` array in [packages/examples/02-forms/src/main.ts](../../examples/02-forms/src/main.ts). Run with
`yarn dev-forms` from the repo root.

**Host the viewer in an existing app instead**: don't use this package — depend on `@forms/report-viewer` directly
and render `ReportViewerPanel`, which is router-agnostic and brings its own theme import.

# `@forms/report-viewer`

Loads a catalog form, populates it from host data, renders it, and saves it back. Owns routing, modals,
notifications, and the **form ↔ data mapper registry**. Depends on `@forms/catalog`, `@forms/core`,
`@common/react-router`, react-router 8.

Module dependencies: `ReactRouterModule`, `FormCatalogModule`.

## Files

| Path | Contents |
| --- | --- |
| [src/module.ts](src/module.ts) | `ReportViewerModule` + `IReportViewerConfiguration` (`registerForm`, `registerRoute`, `registerDataReader`, `registerDataWriter`, `registerMapper`). Registers the `report-viewer` layout route, its index route, and the `*` not-found route. |
| [src/options.ts](src/options.ts) | `IReportViewerOptions`: `data?` (static report data) and `isReadOnly?`. Bound to module settings. |
| [src/services/report-viewer.ts](src/services/report-viewer.ts) | The heart: `IReportViewerService`, `IReportViewerRegistrationService`, `IFormDataReader`, `IFormDataWriter`, `IInitialForm`, `IFormDataContext`. |
| [src/services/navigation.ts](src/services/navigation.ts) | `INavigationService` (`navigateTo`, `currentLocation`, `router`) / `INavigationRegistrationService` (`registerRoute`, `registerChildRoute`). |
| [src/services/modal.ts](src/services/modal.ts) | `IModalService`: `showModal`, `showConfirmModal`, `showSaveChangesModal`. Max 3 concurrent. |
| [src/services/notification.ts](src/services/notification.ts) | `INotificationService.showNotification` — event only; the UI listens. |
| [src/components/report-viewer.tsx](src/components/report-viewer.tsx) | `ReportViewer` — renders `ReportViewerForm` when handed an `initialForm`, otherwise `<Outlet />`. |
| [src/components/report-viewer-form.tsx](src/components/report-viewer-form.tsx) | Owns the `ControllerManager`, wires `useFormController`, applies read-only, sets the delete-page confirmation. **Both `ReportViewer` and `ReportViewerPanel` render this**, so every host wires a form identically. |
| [src/components/report-viewer-loader.tsx](src/components/report-viewer-loader.tsx) | The generic data-driven index route: resolves data from the route context and loads whatever form the data names. |
| [src/components/report-viewer-panel.tsx](src/components/report-viewer-panel.tsx) | Router-agnostic entry point for a host that already has its data. Its `options` carry the form identity plus `isReadOnly` and `showOptions`. Also imports `@forms/core/theme/_main.scss`. |
| [src/components/report-viewer-layout.tsx](src/components/report-viewer-layout.tsx) | Bare `<Outlet />` for the `report-viewer` route. |
| [src/components/report-viewer-options.tsx](src/components/report-viewer-options.tsx) + [options/](src/components/options/) | The floating bottom-right bar: the three built-ins plus whatever `registerOption` added, in one ordered list. |
| [src/components/modal/manager.tsx](src/components/modal/manager.tsx) · [notification/manager.tsx](src/components/notification/manager.tsx) | Subscribe to their service's events and render `FModal` / `FNotification`. |
| [src/components/validation/](src/components/validation/) | Off-canvas list of `IRuleViolation`s. |

## The host data boundary

Two halves, each registered at most once, both host-supplied:

```ts
IFormDataReader { getData(context: IFormDataContext): Promise<IReportViewerData | undefined> }
IFormDataWriter { saveData(data: IReportViewerData, context): Promise<void> }
```

`IFormDataContext` is `{ params, searchParams }` — the route context the form was loaded under, so a reader can
resolve a specific record and a writer can identify the one it writes back to. With no reader registered,
`getData` falls back to `IReportViewerOptions.data`.

The host maps its own record shape into the target form's contract; the report viewer only hands data across.

## The mapper registry — the key seam

```ts
registerMapper(identity: IFormIdentity, mapper: IFormMapper<TForm, TData>)
```

- Keyed `` `${name}@${version}` ``. **Registration throws without a version**, because lookup always goes through a
  resolved catalog item (which always names a concrete version); a versionless mapper could never match and would
  surface as a form that silently neither populates nor saves.
- Looked up against the **catalog item**, not the requested identity — a request naming no version is answered with
  the latest, and the mapper must match what was actually resolved.
- One mapper per identity; duplicates throw.
- This is the one place the concrete `IFormMapper<TForm, TData>` pair is widened, so no form module needs a cast.
- `canSaveForm(identity)` is "is a mapper registered **and** a data writer registered", and gates the save button.
  Both halves matter: with a mapper but no writer, `saveForm` would extract the data, find nothing to hand it to, and
  the save option would still report the report as saved.

## Load and save

`loadForm(data, identity?)`:
1. name = `identity?.name ?? data?.name`; returns `undefined` if neither.
2. resolve the catalog item, `await catalogItem.component()`, `new catalogItem.formFactory()`,
   `await formFactory.createForm().initialize()`.
3. if data **and** a mapper: `form = await mapper.populate(form, data)` (awaited because a repeating-page mapper
   must create pages, which is async).
4. → `IInitialForm { catalogItem, form, formFactory, Component }`.

`loadFormReport(context, identity?)` is `getData` then `loadForm`.

`saveForm(form, catalogItem, context)`: `mapper.extract(form)` (or `{}`), then **stamps `name`, `description`,
`status`, `type`, `version` from the catalog item** — a form model never assigns its own identity, and without the
stamp the saved data could not be resolved back to a form. Hands it to the writer if one is registered, and returns
the data either way.

## The options bar — the other seam

The bar is built from one ordered list: the three built-ins (validate 100, save 200 — still gated on
`canSaveForm` — day/night 900) plus everything `registerOption` has added, sorted on `order`. So a registered option
can sit **between** the built-ins rather than only after them.

```ts
registerOption({ id, order, Component, canShow? })
```

`Component` is handed `IReportViewerOptionProps` — `{ catalogItem, controllers }`, the same two things the built-ins
get. Duplicate ids throw. `canShow(catalogItem)` filters per form; an option without one is always offered.

This exists so a package adding a capability supplies its own button rather than the report viewer taking a
dependency on that package: `@forms/printing` registers the print option at order 300, and nothing here imports it.

## Routing

`configure` registers:
- `report-viewer` (path `/`) → `ReportViewerLayout`, a bare `<Outlet />`;
- its **index** child → `ReportViewerLoader`, the generic data-driven route;
- `not-found` (path `*`).

then `await next()` so form modules can register their own child routes before the host renders.

Two seams register a child route, and which one to use depends on what is being routed:

- **`registerForm({ name, version, route })`** — for a **catalog form**. It registers the child route under
  `report-viewer` *and* records the identity ↔ route pairing, so the route is declared once and a host can ask
  `getForms()` which forms are reachable and where. One route per form name (a route belongs to a form, not to one
  of its versions); a duplicate name throws. `IFormRegistration` extends `IFormIdentity` — a registration carries no
  `status` or `type`, since those are per-instance form state.
- **`registerRoute(name, route)`** — for anything that is **not** a catalog form (the sandbox's home page and demo
  routes). It is `registerChildRoute` on the navigation service and records nothing.

## Two ways to mount a form

| | Route | Component | Use when |
| --- | --- | --- | --- |
| Generic | index route of `report-viewer` | `ReportViewerLoader` → `ReportViewer` | The data names the form; the host has registered a data reader. |
| Form-specific | a form package's own path (`sc/tr310`) | that package's `*FormLoader` → `ReportViewer` | The route is bound to one form; the loader passes a `CATALOG_IDENTITY`. |
| No router at all | — | `ReportViewerPanel` | The host has already resolved and mapped the data and just wants the form mounted. |

## Gotchas

- `ReportViewerForm` creates its own `ControllerManager` unless one is passed in. **Pass one in** when something
  outside the form (a panel of draggable items) needs the same controllers.
- Read-only is applied by `form.setReadOnly()` (disables every field). The `isReadOnly` prop separately suppresses
  add/delete page and drop handlers.
- The delete-page confirmation is installed here (`controller.setConfirmDeletePage`) and removed on unmount, so it
  cannot be skipped by a form that forgets to supply one.
- The save button reads `controllers.getFormController().form` **at click time** — the controller replaces the model
  on every edit, so a captured form would be stale.
- `ModalService` throws past three concurrent modals.

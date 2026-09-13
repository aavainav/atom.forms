# `@forms/report-viewer`

Loads an already-resolved catalog item, populates it from its own data reader, renders it, and saves it back. Owns
routing, modals, notifications and validation — but tracks no form by identity itself. `@forms/catalog` is the one
registry; this package is a pure consumer of whatever catalog item its caller hands it. Depends on `@forms/catalog`,
`@forms/core`, `@common/react-router`, react-router 8.

Module dependencies: `ReactRouterModule`, `FormCatalogModule`.

## Files

| Path | Contents |
| --- | --- |
| [src/module.ts](src/module.ts) | `ReportViewerModule` + `IReportViewerConfiguration` (`registerRoute`, `registerOption`, `registerPanel`). Registers the `report-viewer` layout route, its index route, and the `*` not-found route. |
| [src/options.ts](src/options.ts) | `IReportViewerOptions`: `isReadOnly?` only. Bound to module settings. |
| [src/services/report-viewer.ts](src/services/report-viewer.ts) | The heart: `IReportViewerService`, `IReportViewerRegistrationService`, `IInitialForm`, `IFormReportIdentity`. |
| [src/services/navigation.ts](src/services/navigation.ts) | `INavigationService` (`navigateTo`, `currentLocation`, `router`) / `INavigationRegistrationService` (`registerRoute`, `registerChildRoute`). |
| [src/services/modal.ts](src/services/modal.ts) | `IModalService`: `showModal`, `showConfirmModal`, `showSaveChangesModal`. Max 3 concurrent. |
| [src/services/notification.ts](src/services/notification.ts) | `INotificationService.showNotification` — event only; the UI listens. |
| [src/services/theme.ts](src/services/theme.ts) | `IThemeService`: `theme`, `setTheme`, `toggleTheme`, `onThemeChanged`. Holds the current theme rather than only raising an event, since the option button renders a different icon per theme. |
| [src/services/validation.ts](src/services/validation.ts) | `IValidationService.showIssues` — event only, same shape as notification; `ValidationManager` listens. |
| [src/components/report-viewer.tsx](src/components/report-viewer.tsx) | `ReportViewer` — renders `ReportViewerForm` when handed an `initialForm`, otherwise `<Outlet />`. |
| [src/components/report-viewer-form.tsx](src/components/report-viewer-form.tsx) | Owns the `ControllerManager`, wires `useFormController`, applies read-only, sets the delete-page confirmation. **Both `ReportViewer` and `ReportViewerPanel` render this**, so every host wires a form identically. |
| [src/components/report-viewer-panel.tsx](src/components/report-viewer-panel.tsx) | Router-agnostic entry point for a host that already has its data. Resolves the catalog item itself (via `IFormCatalogService`) from `options`/`data`'s name and version, then calls `loadForm`. Also imports `@forms/core/theme/_main.scss`. |
| [src/components/report-viewer-layout.tsx](src/components/report-viewer-layout.tsx) | Bare `<Outlet />` for the `report-viewer` route. |
| [src/components/report-viewer-options.tsx](src/components/report-viewer-options.tsx) + [options/](src/components/options/) | The floating bottom-right bar: it renders whatever `getOptions` answers with and nothing else. `options/` holds this package's own four, which `module.ts` registers like any other. |
| [src/components/options/report-data-option.tsx](src/components/options/report-data-option.tsx) + [report-data-dialog.tsx](src/components/options/report-data-dialog.tsx) | The `#report-data-button` (order 250), and the modal showing `extractData`'s payload as formatted JSON with a Copy action. The dialog is the **body** only — the chrome belongs to `IModalService`. |
| [src/components/modal/manager.tsx](src/components/modal/manager.tsx) · [notification/manager.tsx](src/components/notification/manager.tsx) · [validation/manager.tsx](src/components/validation/manager.tsx) | Subscribe to their service's events and render `FModal` / `FNotification` / the validation off-canvas. |
| [src/components/panel/manager.tsx](src/components/panel/manager.tsx) | Mounts whatever `registerPanel` added, for this form, alongside the modal, notification and validation managers. A panel is handed `IReportViewerPanelProps` — an option's props without the `title`. |
| [src/components/validation/](src/components/validation/) | Off-canvas list of `IRuleIssue`s; `ValidationManager` owns the open/closed state, `Validation` is the plain presentational off-canvas. |

## The host data boundary and the mapper — now on the catalog item

`IFormDataContext`, `IFormDataReader`, `IFormDataWriter`, `IFormDefaults`, `IFormDataHooks` and `withDataHooks` all
live in `@forms/catalog` — see that package's `CLAUDE.md`. This package only *consumes* what ends up on a resolved
`IFormCatalogItem`: `catalogItem.mapper`, `catalogItem.dataReader`, `catalogItem.dataWriter`. It never looks either
up by identity itself and it plays no part in attaching a host's `IFormDataHooks` — that happens in the caller
(almost always a form's own route loader), before the item ever reaches this package's services.

The consequence worth knowing: because a reader/writer is resolved per identity rather than a single global pair,
**there is no generic, identity-less loading path any more.** Every route has to already know which catalog item
it's loading — resolving *which* form/record a URL means is the host's job, done before `loadForm`/`loadFormReport`
is ever called, not something a reader can be asked to guess from context alone.

## Load and save

Every one of these takes an already-resolved `IFormCatalogItem` — this package never looks one up by identity.

`loadForm(catalogItem, data, readOnlyFields?)`:
1. `await catalogItem.component()`, `new catalogItem.formFactory()`, `await formFactory.createForm().initialize()`.
2. if `data` **and** `catalogItem.mapper`: `form = await catalogItem.mapper.populate(form, data, readOnlyFields)`
   (awaited because a repeating-page mapper must create pages, which is async).
3. → `IInitialForm { catalogItem, form, formFactory, Component }`.

`loadFormReport(catalogItem, context)` is `catalogItem.dataReader?.getData(context)` then `loadForm` — except when
that resolves nothing, in which case it falls back to `catalogItem.dataReader?.getDefaultData?.(context)` first,
passing its `data` and `readOnlyFields` into `loadForm` so a newly created record starts with whatever defaults
(and locks) the reader has configured. A catalog item with no reader simply has nothing to load, and `loadForm`
still runs — the form is built and returned unpopulated.

`extractData(form, catalogItem)`: `catalogItem.mapper?.extract(form)` (or `{}`), then **stamps the whole of
`IForm` — `name`, `description`, `status`, `type`, `version` — from the form model**, which declares the identity
it is registered under and assigns it to itself. Without the stamp the saved data could not be resolved back to a
form. Persists nothing.

`saveForm(form, catalogItem, context)` is `extractData` then `catalogItem.dataWriter?.saveData(data, context)`,
returning the data whether or not a writer consumed it. The extract-and-stamp lives in `extractData` alone so that
**what a preview shows and what a save sends cannot drift** — the report-data option renders exactly this payload
without touching the writer.

`canExtractData(catalogItem)` is `!!catalogItem.mapper`. `canSaveForm(catalogItem)` is that *plus* `!!catalogItem.
dataWriter`. They are different gates on purpose: a form with a mapper but no writer still produces perfectly good
outgoing data, so the report-data option is offered where save is not.

## The options bar — the other seam

**Every option is registered, this package's own included.** `ReportViewerModule.configure` registers validate
(100), save (200), report data (250) and day/night (900) through the very seam a package adding one uses, before
`await next()` lets those packages register theirs — `@forms/printing` puts print at 300 and `@forms/violations`
violations at 150.
`ReportViewerOptions` then renders whatever `getOptions` answers with and knows nothing else: there is no built-in
in the component to special case, no ordering rule that treats one option differently from another, and a
registered option sits **between** this package's own rather than only after them.

```ts
registerOption({ id, order, title, Component, canShow? })
```

- **`title`** is what the option is called. The bar hands it back to `Component` through
  `IReportViewerOptionProps`, so the option renders it as its own tooltip rather than repeating the string — the
  name an option is listed under and the name it shows on hover cannot drift apart.
- **`Component`** is handed `IReportViewerOptionProps` — `{ catalogItem, controllers, title }`. Duplicate ids
  throw.
- **`canShow(catalogItem)`** filters per form; an option without one is always offered. Save's is
  `canSaveForm`, which needs both a mapper and a data writer; report data's is `canExtractData`, the mapper half
  alone; violations' is a registered binding plus the form being a `CitationForm`.

Because an option carries a title and a `canShow`, **what a form offers can be asked for without rendering any of
it** — `getOptions(catalogItem)` is a complete, ordered, already-filtered answer. The sandbox's home page lists
each form's options from exactly that call, which is why a citation lists Violations there and the TR-310 does not.

### Where a per-form gate should live

`canShow` gets the catalog item, so it can gate on anything the catalog knows: the identity, the form's `type`, and
the form family via `catalogItem.ctor.prototype instanceof CitationForm`. It cannot gate on jurisdiction — no state
or agency is modelled anywhere; a form's state lives only in its package path and its name. An option that
genuinely needs to vary by jurisdiction should be registered by the form package that knows its own, rather than by
adding a state to the catalog for one caller to branch on.

## The panel seam — where an off canvas goes

```ts
registerPanel({ id, Component, canShow? })
```

Registered panels are mounted by `PanelManager` at the report viewer's root, beside `ModalManager`,
`NotificationManager` and `ValidationManager`, and are handed the same `IReportViewerOptionProps` the options get.
Duplicate ids throw. There is no `order`: a panel positions itself against an edge of the viewport rather than
sharing a strip, so there is nothing for an order to mean.

**A panel cannot be rendered from the option that opens it.** The options bar is `position-fixed` and therefore a
stacking context, which ranks anything fixed inside it only against the bar's own contents however high its
z-index — the same trap that put the print dialog behind `IModalService` rather than inside `PrintOption`. A panel
is mounted for as long as the form is and decides for itself whether it is showing, which is what lets the option
be a plain button raising an event on a service.

## Day/night mode

Bootstrap 5.3 resolves its color mode from a `data-bs-theme` attribute and the compiled theme already carries the
whole dark palette, so `ThemeService.setTheme` stamps the attribute on `document.documentElement` and nothing else
is needed. It goes on the document rather than on an element the viewer renders because the viewer never owns the
document — `ReportViewerPanel` mounts without even the `#report-viewer` wrapper — and the host's own chrome should
follow the toggle too.

**`FPage` pins itself back to `data-bs-theme="light"`.** A page is a printed document: it is white paper with a
dark border in either mode, and letting the attribute cascade into it would leave every input, select and checkbox
on the page rendered dark against white. Bootstrap supports nesting color modes, so pinning the page converges on
dark chrome around light paper, and leaves the print branch unaffected whichever mode the app is in.

The theme is **not persisted** — it survives in-app navigation, since the service is a singleton living as long as
the app's runtime, but a reload starts light again.

## Routing

`configure` registers:
- `report-viewer` (path `/`) → `ReportViewerLayout`, a bare `<Outlet />`;
- `not-found` (path `*`).

then `await next()` so form modules can register their own child routes before the host renders.

**Nothing is registered as the index route**, so the root belongs to the host.

This package tracks no identity-to-route pairing of its own — `registerRoute(name, route)` is `registerChildRoute`
on the navigation service, plain and generic, used identically whether the route belongs to a catalog form or not
(the sandbox's home page and demo routes use the same seam). A catalog form's own route is registered the same
way, by whichever package owns that route — usually the form package itself, right alongside its own
`registerCatalogItem` call. Nothing here records which route belongs to which form; a host that wants to list
"every form and where it lives" keeps that mapping itself (see the sandbox's `home-page.tsx`).

## Mounting a form

| | Route | Component | Use when |
| --- | --- | --- | --- |
| Form-specific | a form package's own path (`sc/tr310`) | that package's `*FormLoader` → `ReportViewer` | The loader resolves the catalog item (`formCatalogService.get(CATALOG_IDENTITY)`), attaches a host's data boundary via `withDataHooks(catalogItem, services.tryGet(IFormDataHooks))`, and calls `loadFormReport(catalogItem, context)`. |
| No router at all | — | `ReportViewerPanel` | The host has already resolved and mapped the data and just wants the form mounted; `ReportViewerPanel` resolves the catalog item itself and calls `loadForm`. |

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

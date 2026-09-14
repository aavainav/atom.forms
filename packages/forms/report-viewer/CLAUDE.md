# `@forms/report-viewer`

**The top of the stack and the only part of it a host app renders.** A host names a form and hands over its data;
this package resolves the catalog item, builds the form model, populates it, mounts the options and panels the form
offers, and renders it. Depends on `@forms/catalog`, `@forms/core`, `@forms/value-lists`, `@forms/violations`,
`@forms/printing`.

Module dependencies: `FormCatalogModule`, `ValueListsModule`, `ViolationsModule`, `PrintingModule`.

It depends on every package whose capability it offers rather than letting them register into it. That direction is
the point: a form package, a violation list and a print copy all exist without a viewer, while a viewer is not much
without them. **Nothing anywhere depends on this package except a host** — no form package, no plugin package, not
even the workbench.

```
                report-viewer          ← what a host app renders
                 ↙   ↓   ↓   ↘
      catalog  value-lists  violations  printing
```

## The whole API

```tsx
<ReportViewer identity={{ name: "S438 Citation Form", version: "1.0" }} dataManager={…} settings={{ showOptions: true }} />
```

Three props, nothing else:

| Prop | |
| --- | --- |
| `identity` | `IFormIdentity`. The catalog resolves it, answering with the latest version when none is named. |
| `dataManager` | `IDataManager` — where the record is read from and written back to. Optional: without one the form renders blank and unsaveable. |
| `settings` | `IReportViewerSettings` — `isReadOnly?` and `showOptions?`. How the report renders, as opposed to which one. |

There is deliberately **no `controllers` prop**. A host needing shared controllers or a mutation of the loaded model
takes the advanced path instead: `IReportViewerService.loadForm(identity, dataManager)` then `<ReportViewerForm />`,
which is exactly what `ReportViewer` itself does. Both sandbox demos sit on that path.

`ReportViewer` keys its inner `FAsyncLoader` on `` `${identity.name}@${identity.version}` ``. That key is
**load-bearing**: `FAsyncLoader` runs its `op` once on mount, so without it a changed `identity` prop would leave
the previously loaded form on screen.

## Files

| Path | Contents |
| --- | --- |
| [src/module.ts](src/module.ts) | `ReportViewerModule`. Registers five services and nothing else — there is no configuration seam, because there is nothing left to register with it. |
| [src/services/report-viewer.ts](src/services/report-viewer.ts) | The heart: `IDataManager`/`IDataManagerResult`, `IInitialForm`, `IReportViewerService`, `IReportViewerOption(Props)`, `IReportViewerPanelProps`, and **the built-in option table**. |
| [src/services/modal.ts](src/services/modal.ts) | `IModalService`: `showModal`, `showConfirmModal`, `showSaveChangesModal`. Max 3 concurrent. Re-exports core's modal types, `IModalOptions` included. |
| [src/services/notification.ts](src/services/notification.ts) | `INotificationService.showNotification` — event only; the UI listens. |
| [src/services/theme.ts](src/services/theme.ts) | `IThemeService`: `theme`, `setTheme`, `toggleTheme`, `onThemeChanged`. Holds the current theme rather than only raising an event, since the option button renders a different icon per theme. |
| [src/services/validation.ts](src/services/validation.ts) | `IValidationService.showIssues` — event only, same shape as notification; `ValidationManager` listens. |
| [src/components/report-viewer.tsx](src/components/report-viewer.tsx) | `ReportViewer` and `IReportViewerSettings`. Also the one `import "@forms/core/theme/_main.scss"` in the graph. |
| [src/components/report-viewer-form.tsx](src/components/report-viewer-form.tsx) | Owns the `ControllerManager`, wires `useFormController`, applies read-only, sets the delete-page confirmation, and builds the `onError` the plugin components report through. |
| [src/components/report-viewer-options.tsx](src/components/report-viewer-options.tsx) + [options/](src/components/options/) | The floating bottom-right bar: it renders whatever `getOptions` answers with, under a suspense boundary. `options/` holds this package's own four. |
| [src/components/options/report-data-option.tsx](src/components/options/report-data-option.tsx) + [report-data-dialog.tsx](src/components/options/report-data-dialog.tsx) | The `#report-data-button`, and the modal showing `extractData`'s payload as formatted JSON with a Copy action. The dialog is the **body** only — the chrome belongs to `IModalService`. |
| [src/components/modal/manager.tsx](src/components/modal/manager.tsx) · [notification/manager.tsx](src/components/notification/manager.tsx) · [validation/manager.tsx](src/components/validation/manager.tsx) | Subscribe to their service's events and render `FModal` / `FNotification` / the validation off-canvas. |
| [src/components/panel/manager.tsx](src/components/panel/manager.tsx) | Mounts the violations panel, for a form that declares a `violationListId`, alongside the other managers. |
| [src/components/validation/](src/components/validation/) | Off-canvas list of `IRuleIssue`s; `ValidationManager` owns the open/closed state, `Validation` is the plain presentational off-canvas. |

## `IDataManager` — the host's side of the data

```ts
interface IDataManager<TData extends object = IReportViewerData> {
    read(): Promise<IDataManagerResult<TData> | undefined>;
    write?(data: IReportViewerData): Promise<void>;
}

interface IDataManagerResult<TData extends object = IReportViewerData> {
    readonly data: TData;
    readonly readOnlyFields?: ReadonlyArray<keyof TData & string>;
}
```

- **`read()` takes no arguments.** The host owns its own routing, so a manager closes over whichever record it was
  built for rather than being handed a context to guess from.
- **There is no separate notion of defaults.** A host with no record yet answers with the values a new one should
  start with; resolving `undefined` loads a blank form. One path, not two.
- **`readOnlyFields` is typed against the contract**, so a misspelled key is a compile error rather than a lock that
  silently does nothing, and it is an **array** because a host writes a literal here. `loadForm` converts it to the
  `ReadonlySet` the mapper looks keys up in — sets are what the mapper wants, arrays are what the caller wants to
  write. A field the mapper has not wired up for locking (see `FormMapper.write` in `@forms/core`) stays editable
  regardless of being named.
- **`write` doesn't depend on `TData`.** It always takes the full `IReportViewerData` -- `extractData` stamps
  `name`/`status`/`type`/`version` on top of whatever the mapper narrowly produces, so what comes back out is never
  just the contract that went in. That's why the props, the options bar and `saveForm` all type their `dataManager`
  as `IDataManager<any>` rather than being made generic over a `TData` they never call `read()` with: `any` erases
  only the part of the type they don't use, and `IDataManager<IS438Data>` (say) is freely assignable to it either
  way, which a concrete default like `IDataManager<IReportViewerData>` is not -- `IS438Data` doesn't itself carry
  `name`/`status`/`type`/`version`, so it isn't assignable to `IReportViewerData`.

## Load and save

`loadForm(identity, dataManager?)`:
1. `formCatalogService.get(identity)` — **this package does the lookup now**, which is what lets a host hand over an
   identity rather than a resolved catalog item.
2. `await catalogItem.component()`, `new catalogItem.formFactory()`, `await formFactory.createForm().initialize()`.
3. `await dataManager?.read()`; if it answered and the item has a mapper,
   `form = await catalogItem.mapper.populate(form, data, new Set(readOnlyFields))` (awaited because a
   repeating-page mapper must create pages, which is async).
4. → `IInitialForm { catalogItem, form, formFactory, Component }`.

`extractData(form, catalogItem)`: `catalogItem.mapper?.extract(form)` (or `{}`), then **stamps the whole of
`IForm` — `name`, `description`, `status`, `type`, `version` — from the form model**, which declares the identity
it is registered under and assigns it to itself. Without the stamp the saved data could not be resolved back to a
form. Persists nothing.

`saveForm(form, catalogItem, dataManager?)` is `extractData` then `dataManager?.write?.(data)`, returning the data
whether or not it was consumed. The extract-and-stamp lives in `extractData` alone so that **what a preview shows
and what a save sends cannot drift** — the report-data option renders exactly this payload without touching the
writer.

`canExtractData(catalogItem)` is `!!catalogItem.mapper`. `canSaveForm(catalogItem, dataManager?)` is that *plus*
`!!dataManager?.write`. They are different gates on purpose: a form with a mapper but nowhere to write still
produces perfectly good outgoing data, so the report-data option is offered where save is not.

## The options bar — a closed list, gated by the catalog item

`registerOption`/`registerPanel` are **gone**. The options are declared in one table in
[src/services/report-viewer.ts](src/services/report-viewer.ts), in the order the bar renders them:

| id | offered when |
| --- | --- |
| `validate` | always |
| `violations` | `!!catalogItem.violationListId` |
| `save` | `!!catalogItem.mapper && !!dataManager?.write` |
| `report-data` | `!!catalogItem.mapper` |
| `print` | always |
| `day-night-mode` | always |

`getOptions(catalogItem, dataManager?)` **stays** as a read API: it answers with a complete, ordered, already
filtered list, so **what a form offers can be asked for without rendering any of it**. The sandbox home page lists
each form's option badges from exactly that call.

Two of the six components are imported from packages *below* this one (`ViolationsOption` from `@forms/violations`,
`PrintOption` from `@forms/printing`) rather than being handed up through a registration seam. All six go through
`React.lazy`, so the bar renders under a `<Suspense fallback={null}>`; the report viewer's own four genuinely split
into their own chunk. Every one of them is rendered with `IReportViewerOptionProps`, which is a **superset** of what
any one option takes — a component declaring fewer props is assignable, so no adapters are needed.

**`showModal` and `onError` are props, not services.** The two components from below cannot resolve this package's
services, so the bar hands down a `showModal` bound to `IModalService` and an `onError` bound to
`INotificationService`. The modal in particular has to be opened at the viewer's root: the bar is `position-fixed`
and therefore a stacking context, and a modal opened inside one is painted under the backdrop appended to the body.

The trade-off this closes: **a third party can no longer add an option.** That was accepted deliberately in exchange
for the dependency direction.

### Where a per-form gate should live

A gate reads the catalog item, so it can use anything the catalog knows: the identity, the form's `type`, its
declared `violationListId`/`valueListIds`, and the form family via `catalogItem.ctor.prototype instanceof
CitationForm`. Prefer a declaration on the catalog item over an inferred one — the violations gate is
`!!catalogItem.violationListId` precisely because that is the form saying so, rather than the viewer working it out
from what happened to be registered elsewhere.

## The panel seam — where an off canvas goes

`PanelManager` mounts the violations panel at the report viewer's root, beside `ModalManager`,
`NotificationManager` and `ValidationManager`, on the same `violationListId` gate the option uses.

**A panel cannot be rendered from the option that opens it.** The options bar is `position-fixed` and therefore a
stacking context, which ranks anything fixed inside it only against the bar's own contents however high its
z-index — the same trap that put the print dialog behind `IModalService`. A panel is mounted for as long as the form
is and decides for itself whether it is showing, which is what lets the option be a plain button raising an event on
a service.

## Day/night mode

Bootstrap 5.3 resolves its color mode from a `data-bs-theme` attribute and the compiled theme already carries the
whole dark palette, so `ThemeService.setTheme` stamps the attribute on `document.documentElement` and nothing else
is needed. It goes on the document rather than on an element the viewer renders because the viewer never owns the
document, and the host's own chrome should follow the toggle too.

**`FPage` pins itself back to `data-bs-theme="light"`.** A page is a printed document: it is white paper with a
dark border in either mode, and letting the attribute cascade into it would leave every input, select and checkbox
on the page rendered dark against white. Bootstrap supports nesting color modes, so pinning the page converges on
dark chrome around light paper, and leaves the print branch unaffected whichever mode the app is in.

The theme is **not persisted** — it survives in-app navigation, since the service is a singleton living as long as
the app's runtime, but a reload starts light again.

## Routing — there is none

This package registers no routes, owns no navigation service, and does not depend on react-router at all. A route is
the host's, and the root layout plus the `*` not-found live in [`@forms/workbench`](../workbench/). `ReportViewer`
is a component; mount it wherever the host's router puts it.

## Gotchas

- `ReportViewerForm` creates its own `ControllerManager` unless one is passed in. **Pass one in** when something
  outside the form (a panel of draggable items) needs the same controllers.
- Read-only is applied by `form.setReadOnly()` (disables every field). The `isReadOnly` prop separately suppresses
  add/delete page and drop handlers. It is a **per-instance** setting, not an app-wide one: an issued citation
  versus a draft is a per-record decision.
- The delete-page confirmation is installed here (`controller.setConfirmDeletePage`) and removed on unmount, so it
  cannot be skipped by a form that forgets to supply one.
- The save button reads `controllers.getFormController().form` **at click time** — the controller replaces the model
  on every edit, so a captured form would be stale.
- `ModalService` throws past three concurrent modals.
- **The theme import lives on `report-viewer.tsx`.** It is the only one in the graph; move it and a host renders
  unstyled.
- Since this package depends on violations and printing, **every host ships them**. The list *data* is still
  dynamically imported by its own definitions, which is where the real weight is.

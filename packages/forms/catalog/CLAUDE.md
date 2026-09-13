# `@forms/catalog`

The registry of forms available for data-driven rendering, keyed by **name + version** — the source of truth for
everything a form needs to be resolved, populated, saved and rendered. Four source files; the whole package is one
service and one shrub module.

## Files

| Path | Contents |
| --- | --- |
| [src/module.ts](src/module.ts) | `FormCatalogModule` + `IFormCatalogConfiguration` (`registerCatalogItem` — the only registration seam). Registers `FormCatalogService` under both service interfaces via one `SingletonServiceFactory`. |
| [src/services/form-catalog.ts](src/services/form-catalog.ts) | `IFormCatalogItem`, `IFormComponentProps`, `IFormDataContext`, `IFormDataReader`, `IFormDataWriter`, `IFormDefaults`, `IFormDataHooks`, `withDataHooks`, `IFormCatalogService` (read), `IFormCatalogRegistrationService` (write), and the `FormCatalogService` implementing both. |
| [src/services/index.ts](src/services/index.ts) · [src/index.ts](src/index.ts) | Barrels. |

## `IFormCatalogItem` — what a form registers

```ts
{ name, description, type, version,
  ctor:        FormModelConstructor<TForm>,     // creates and builds the initial model
  schema:      SchemaConstructor<TSchema>,      // the definition tree
  formFactory: FormFactoryConstructor<TForm>,   // creates the form and additional pages
  component:   () => Promise<ComponentType<IFormComponentProps>>,  // lazily imported

  mapper?:      IFormMapper<TForm, TData>,   // translates between the form and the contract it publishes
  dataReader?:  IFormDataReader,             // supplies the report data to load for this form
  dataWriter?:  IFormDataWriter,             // persists this form's saved report data

  violationListId?: string,                 // the violation list this citation draws its charges from, if any
  valueListIds?: ReadonlyArray<string> }     // the value lists this form's option fields draw on
```

`IFormComponentProps` is `{ controllers: IControllerManager, isReadOnly: boolean }` — the contract every form's
root component implements.

## The catalog is the one registry — nothing else tracks a form by identity

Everything about a form is reachable from the catalog item `get()`/`getLatestVersions()` hands back: identity,
definition, and (once a host has attached them - see below) its mapper and the read/write halves of its data
boundary. `@forms/report-viewer` registers and tracks none of this itself any more — every one of its service
methods takes an already-resolved `IFormCatalogItem` from its caller rather than looking one up by identity. A
route is the one thing a catalog item does **not** carry: routing is a navigation concern, registered directly
through `@forms/report-viewer`'s generic `registerRoute` seam by whichever package owns that route, same as any
non-catalog route.

**`registerCatalogItem` is the only registration call, and it runs exactly once per identity.** There's a single
`Map<name, Map<version, IFormCatalogItem>>` internally, no separate side-table or seam for the mapper - `mapper` is
just a plain field on the object, filled in inline, because it's always hand-written by the same form package that
registers the item, in the same `configure()` call. A second `registerCatalogItem` for a name+version already
registered throws, same as always.

## The host data boundary - attached after the fact, not registered

`dataReader`/`dataWriter` are the one part of `IFormCatalogItem` the catalog **never** sets. The form package that
calls `registerCatalogItem` has no idea what a host's data source looks like, so those two fields are left unset by
the catalog and instead attached later, at load time, via `IFormDataHooks`:

```ts
export interface IFormDataHooks {
    getDataReader?(identity: IFormIdentity): IFormDataReader | undefined;
    getDataWriter?(identity: IFormIdentity): IFormDataWriter | undefined;
}
```

A host implements this once - typically backed by whatever table or lookup maps its own identities to fixtures or
a backend call - and registers it as a plain service (`registration.registerInstance(IFormDataHooks, ...)` in
`configureServices`, not through any config/registration call). Whatever resolves a catalog item to load or save it
(almost always a form's own route loader) then calls the exported `withDataHooks(catalogItem, hooks)` helper before
handing the item to `IReportViewerService`:

```ts
const catalogItem = withDataHooks(await formCatalogService.get(identity), services.tryGet(IFormDataHooks));
return reportViewerService.loadFormReport(catalogItem, context);
```

`services.tryGet` (on `IServiceCollection`) is what makes this safe with no host implementation registered at all -
it returns `undefined` rather than throwing, and `withDataHooks` just hands the item back unchanged in that case.
This is also why it happens at *load* time rather than at registration time: `configureServices` for every module
runs before any module's `configure()`, but resolving a catalog item and loading it happens later still, after the
whole app has finished configuring - so there's no ordering hazard between the form package that defines a form and
the host that supplies its data, the way there would be if this had to happen during `configure()`.

`IFormDataReader`/`IFormDataWriter`/`IFormDataContext`/`IFormDefaults` shapes:

```ts
IFormDataReader { getData(context): Promise<IReportViewerData | undefined>; getDefaultData?(context): Promise<IFormDefaults | undefined> }
IFormDataWriter { saveData(data: IReportViewerData, context): Promise<void> }
IFormDataContext { params, searchParams }   // the route context the form was loaded under
IFormDefaults { data: IReportViewerData, readOnlyFields?: ReadonlySet<string> }
```

**`getDefaultData` is the values a *new* record should start with**, reached by `IReportViewerService.loadFormReport`
only once `getData` resolved nothing to load. `readOnlyFields` names which of `data`'s own fields should come back
locked rather than editable, understood by the target form's mapper (see `FormMapper.write` in `@forms/core`). It
is optional per reader, checked on the *method* rather than on whether a reader is attached at all.

Because a reader/writer is resolved per identity rather than as one global fallback, resolving *which* form to load
is entirely the job of whatever resolves the route to a catalog item before calling into the report viewer - there
is no generic, identity-less loading path. A host mapping its own record shape into a form's contract still does
that inside its reader/writer, same as ever; it just answers per identity through `IFormDataHooks` rather than
guessing which form it's being asked for from an untyped blob of context.

## The mapper - inline, not a seam

`mapper` is a plain optional field on the object passed to `registerCatalogItem`, not a separate call:

```ts
catalog.registerCatalogItem({
    name, description, type, version, ctor, schema, formFactory, component,
    mapper: new MyMapper()
});
```

- A form without one simply neither populates nor saves - `IReportViewerService.canExtractData`/`canSaveForm` gate
  on whether it's set.
- `registerCatalogItem<TForm, TSchema, TData>` is generic over the mapper's data contract (`TData`, defaulted to
  `IReportViewerData`) specifically so this inference works - TypeScript reads `TData` off the `mapper` field you
  pass, the same way it already reads `TForm`/`TSchema` off `ctor`/`schema`.
- `IReportViewerService.canSaveForm(catalogItem)` is "does it carry both a mapper and a data writer" — both matter:
  with a mapper but no writer, `saveForm` would extract the data, find nothing to hand it to, and the save option
  would still report the report as saved.

## The one design rule that's changed

A catalog item used to hold *definition* data only, with mapping and data left to `@forms/report-viewer`. That
split is gone: **the catalog is now the one place a form's whole registration lives** - its identity, definition,
mapper, value-list/violation-list keys, and (attached rather than registered) its data boundary. What still doesn't
belong here is anything about *how* the form is rendered or routed to — that stays `@forms/report-viewer`'s and the
host's.

## Resolution semantics

- `registerCatalogItem` throws on a duplicate name+version.
- `get({ name, version })` with no `version` returns the **latest**, computed as the descending `localeCompare` of
  the registered version strings on read (not at registration time, so modules can register incrementally). Versions
  are therefore compared as strings — `"1.10"` sorts below `"1.9"`.
- `get` throws for an unknown name, and for a known name with an unknown version.
- `getLatestVersions()` returns a `Map<name, IFormCatalogItem>`.

## Recipe: register a form

From the form package's `module.ts` `configure`, after constructing its schema:

```ts
const { name, description, version } = CATALOG_IDENTITY;   // exported by the form model's own file

new MyFormSchema();

catalog.registerCatalogItem({
    name, description, type: "citation", version,
    ctor: MyFormModel, schema: MyFormSchema, formFactory: MyFormFactory,
    component: () => import("./components").then(m => m.MyForm),
    mapper: new MyMapper()
});

const reportViewer = config.get<IReportViewerConfiguration>(IReportViewerConfiguration);
reportViewer.registerRoute("report-viewer", { path: "my/form", lazy: () => import("./components").then(m => ({ Component: m.MyFormLoader })) });
```

`MyFormLoader` (the route's own component) is what actually attaches a host's data boundary, at load time - see
`packages/forms/south-carolina/s438/src/components/s438-citation-form-loader.tsx` for the pattern every form's
loader follows: `useServices().tryGet(IFormDataHooks)`, then `withDataHooks(catalogItem, hooks)` before calling
`loadFormReport`.

A host wanting to supply this form's data implements `IFormDataHooks` once, keyed by whatever identities it knows
about, and registers it as a plain service:

```ts
class MyHostDataHooks implements IFormDataHooks {
    getDataReader(identity: IFormIdentity): IFormDataReader | undefined { /* ... */ }
    getDataWriter(identity: IFormIdentity): IFormDataWriter | undefined { /* ... */ }
}

// in the host's own module
configureServices(registration: IServiceRegistration): void {
    registration.registerInstance(IFormDataHooks, new MyHostDataHooks());
}
```

**The identity is declared once, as a `CATALOG_IDENTITY` constant beside the form model, and never as a literal
here.** The model assigns it to its own `name`/`description`/`version`, which is what `extractData` stamps a saved
report with; the module registers the catalog item and the route from the same constant, and the route loader
passes it as its pinned identity.

That matters because the identity a form's model stamps on itself must match the one its catalog item was
registered under — a mismatch would stamp saved records with an identity the catalog cannot resolve.

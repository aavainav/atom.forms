# `@forms/catalog`

The registry of forms available for data-driven rendering, keyed by **name + version** — the source of truth for
everything a form *is*. Four source files; the whole package is one service and one shrub module.

## Files

| Path | Contents |
| --- | --- |
| [src/module.ts](src/module.ts) | `FormCatalogModule` + `IFormCatalogConfiguration` (`registerCatalogItem` — the only registration seam). Registers `FormCatalogService` under both service interfaces via one `SingletonServiceFactory`. |
| [src/services/form-catalog.ts](src/services/form-catalog.ts) | `IFormCatalogItem`, `IFormComponentProps`, `IFormCatalogService` (read), `IFormCatalogRegistrationService` (write), and the `FormCatalogService` implementing both. |
| [src/services/index.ts](src/services/index.ts) · [src/index.ts](src/index.ts) | Barrels. |

## `IFormCatalogItem` — what a form registers

```ts
{ name, description, type, version,
  ctor:        FormModelConstructor<TForm>,     // creates and builds the initial model
  schema:      SchemaConstructor<TSchema>,      // the definition tree
  formFactory: FormFactoryConstructor<TForm>,   // creates the form and additional pages
  component:   () => Promise<ComponentType<IFormComponentProps>>,  // lazily imported

  mapper?:      IFormMapper<TForm, TData>,   // translates between the form and the contract it publishes

  violationListId?: string,                  // the violation list this citation draws its charges from, if any
  valueListIds?: ReadonlyArray<string> }     // the value lists this form's option fields draw on
```

`IFormComponentProps` is `{ controllers: IControllerManager, isReadOnly: boolean }` — the contract every form's
root component implements.

## Where the *data* is not

**A catalog item holds no data boundary at all.** It is the form's definition: what builds it, what renders it, what
translates it to and from the contract it publishes, and which shared lists it draws on. Where a *record* comes from
is the host's, handed to `<ReportViewer />` as an `IDataManager` prop when it renders the form — see
[`@forms/report-viewer`](../report-viewer/CLAUDE.md).

That is a deliberate split. A form package knows everything in the list above on the day it is written and nothing
at all about a host's storage; a host knows the record and nothing about the form's field tree. Putting a reader or
writer on the catalog item meant something had to attach it after registration, which is a seam that no longer
exists.

A route is likewise **not** on a catalog item: routing is the host's, registered through
[`@forms/workbench`](../workbench/)'s generic `registerRoute` (or whatever router the host already has). Nothing
here records which route belongs to which form; a host that wants "every form and where it lives" keeps that
mapping itself (see the sandbox's `src/form-routes.ts`).

## The catalog is the one registry

Everything about a form is reachable from the catalog item `get()`/`getLatestVersions()` hands back.
`@forms/report-viewer` registers and tracks none of it — it asks the catalog for an identity and reads the item's
own declarations to decide what to offer:

| Field | Read by |
| --- | --- |
| `mapper` | `canExtractData`, `loadForm`'s populate, `extractData`, the report-data option |
| `violationListId` | whether the violations option and panel are mounted |
| `component`/`formFactory`/`ctor`/`schema` | `loadForm` |

**`registerCatalogItem` is the only registration call, and it runs exactly once per identity.** There is a single
`Map<name, Map<version, IFormCatalogItem>>` internally, no side-table and no separate seam for the mapper — `mapper`
is a plain field on the object, filled in inline, because it is always hand-written by the same form package that
registers the item, in the same `configure()` call. A second `registerCatalogItem` for a name+version already
registered throws.

`registerCatalogItem<TForm, TSchema, TData>` is generic over the mapper's data contract (`TData`, defaulted to
`IReportViewerData`) specifically so inference works: TypeScript reads `TData` off the `mapper` field you pass, the
same way it already reads `TForm`/`TSchema` off `ctor`/`schema`.

## Resolution semantics

- `registerCatalogItem` throws on a duplicate name+version.
- `get({ name, version })` with no `version` returns the **latest**, computed as the descending `localeCompare` of
  the registered version strings on read (not at registration time, so modules can register incrementally). Versions
  are therefore compared as strings — `"1.10"` sorts below `"1.9"`.
- `get` throws for an unknown name, and for a known name with an unknown version.
- `getLatestVersions()` returns a `Map<name, IFormCatalogItem>`.

## Recipe: register a form

From the form package's `module.ts` `configure`, after constructing its schema — and that is the *whole* of what a
form package wires up now:

```ts
const { name, description, version } = CATALOG_IDENTITY;   // exported by the form model's own file

new MyFormSchema();

catalog.registerCatalogItem({
    name, description, type: "citation", version,
    ctor: MyFormModel, schema: MyFormSchema, formFactory: MyFormFactory,
    component: () => import("./components").then(m => m.MyForm),
    mapper: new MyMapper(),
    violationListId: MyViolationListId.violation   // only if it takes the selector
});
```

**The identity is declared once, as a `CATALOG_IDENTITY` constant beside the form model, and never as a literal
anywhere else.** The model assigns it to its own `name`/`description`/`version`, which is what `extractData` stamps
a saved report with, and the module registers the catalog item from the same constant. A mismatch would stamp saved
records with an identity the catalog cannot resolve.

A host then renders the form by that identity, with whatever data manager it holds for the record:

```tsx
<ReportViewer identity={{ name: "S438 Citation Form", version: "1.0" }} dataManager={myDataManager} />
```

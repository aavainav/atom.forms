# `@forms/catalog`

The registry of forms available for data-driven rendering, keyed by **name + version**. It resolves an identity to
the code needed to construct and render one form; everything about what that form *does* — its mapper, which value
lists it draws on, which violation list it charges from — lives on the form model itself, not here. Four source
files; the whole package is one service and one shrub module.

## Files

| Path | Contents |
| --- | --- |
| [src/module.ts](src/module.ts) | `FormCatalogModule` + `IFormCatalogConfiguration` (`registerCatalogItem` — the only registration seam). Registers `FormCatalogService` under both service interfaces via one `SingletonServiceFactory`. |
| [src/services/form-catalog.ts](src/services/form-catalog.ts) | `IFormCatalogItem` (cheap, registered), `ILoadedFormCatalogItem` (what `load()` resolves to), `IResolvedFormCatalogItem` (the intersection), `IFormComponentProps`, `IFormCatalogService` (read), `IFormCatalogRegistrationService` (write), and the `FormCatalogService` implementing both. |
| [src/services/index.ts](src/services/index.ts) · [src/index.ts](src/index.ts) | Barrels. |

## `IFormCatalogItem` — the cheap, always-available half

```ts
{ name, description, type, version,
  load: () => Promise<ILoadedFormCatalogItem> }
```

`ILoadedFormCatalogItem` is what `load()` resolves to — everything needed to construct and render one instance of
the form:

```ts
{ ctor:      FormModelConstructor<TForm>,     // creates a new, uninitialized instance of the form
  schema:    SchemaConstructor<TSchema>,      // constructing it builds the form's whole definition tree
  component: ComponentType<IFormComponentProps> }
```

`IResolvedFormCatalogItem` is `IFormCatalogItem & ILoadedFormCatalogItem` — a registered item together with what
loading it resolved to, which is what `FormCatalogService.get()` hands back.

`IFormComponentProps` is `{ controllers: IControllerManager, isReadOnly: boolean }` — the contract every form's
root component implements.

**Nothing about a form's own code — its model, schema, or component — is imported or evaluated until `load()` is
called.** `type` is the one piece of metadata declared eagerly, because it is the one thing worth showing (a
citation/crash/warning badge) before a form has ever been opened; everything else about what the form does waits
for construction.

## Where the *data* and the *behavior* are not

**A catalog item carries no data boundary and no self-description of its own.** It only resolves an identity to
code. Where a *record* comes from is the host's, handed to `<ReportViewer />` as an `IReportViewerDataManager` prop
when it renders the form — see [`@forms/report-viewer`](../report-viewer/CLAUDE.md). And what a form *does* —
`mapper`, `valueListIds`, `violationListId`, `ruleCollection` — is self-described on the constructed `FormModel`
instance, not declared on the catalog item. Asking "does this form have a mapper" means constructing it; the catalog
alone cannot answer that, by design — see [`@forms/core`](../core/CLAUDE.md)'s `FormModel`.

That is a deliberate split. A form package knows its own code on the day it is written and nothing at all about a
host's storage; a host knows the record and nothing about the form's field tree; and a form's own behavior is the
form's to declare on itself once it exists, not a second place for the catalog to track and keep in sync.

A route is likewise **not** on a catalog item: routing is the host's, registered through
[`@forms/workbench`](../workbench/)'s generic `registerRoute` (or whatever router the host already has). Nothing
here records which route belongs to which form; a host that wants "every form and where it lives" keeps that
mapping itself (see the sandbox's `src/form-routes.ts`).

## Resolution semantics — cheap to list, loaded and cached once to use

- `registerCatalogItem` throws on a duplicate name+version. It runs exactly once per identity, from the form
  package's own `module.ts`.
- `getLatestVersions()` returns a `Map<name, IFormCatalogItem>` and **never calls `load()`** — safe to call to list
  what's available without downloading or evaluating any form's own code.
- `get({ name, version })` with no `version` resolves the **latest**, computed as the descending `localeCompare` of
  the registered version strings on read (not at registration time, so modules can register incrementally). Versions
  are therefore compared as strings — `"1.10"` sorts below `"1.9"`.
- `get` calls `load()` the first time an identity is asked for and **caches the promise it returns**, keyed by
  `` `${name}@${version}` `` — so a form opened twice in quick succession shares one load, `load()`'s own schema
  construction never runs more than once, and a form nobody opens costs nothing beyond its registration.
- `get` throws for an unknown name, and for a known name with an unknown version.

## Recipe: register a form

From the form package's `module.ts` `configure`, declared right on the `registerCatalogItem` call — no separate
form-factory or bootstrapper file needed:

```ts
export const CATALOG_IDENTITY = { name: "My Form", description: "...", version: "1.0" } as const;

async configure({ config, services }: IModuleConfigurator): Promise<void> {
    const { name, description, version } = CATALOG_IDENTITY;
    const catalog = config.get<IFormCatalogConfiguration>(IFormCatalogConfiguration);

    catalog.registerCatalogItem({
        name, description, type: "citation", version,
        load: () => Promise.all([
            import("./models/my-form"),
            import("./models/my-form-schema"),
            import("./components")
        ]).then(([formModule, schemaModule, componentModule]) => {
            new schemaModule.MyFormSchema();

            return {
                ctor: formModule.MyFormModel,
                schema: schemaModule.MyFormSchema,
                component: componentModule.MyForm
            };
        })
    });
}
```

**The identity is declared once, as a `CATALOG_IDENTITY` constant exported from `module.ts`, and never as a literal
anywhere else.** The form model imports it to assign its own `name`/`description`/`version`, which is what
`FormModel.extractData()` stamps a saved report with, and the module registers the catalog item from the same
constant. A mismatch would stamp saved records with an identity the catalog cannot resolve.

A form that draws on value lists, a violation list, or print profiles registers those from inside the same `load()`
call, dynamically importing their own modules alongside the form's — so a value list is never loaded, and a
violation list never registered, until a form that actually uses it has been opened. See a form package's own
`module.ts` for the full pattern.

A host then renders the form by that identity, with whatever data manager it holds for the record:

```tsx
<ReportViewer identity={{ name: "S438 Citation Form", version: "1.0" }} dataManager={myDataManager} />
```

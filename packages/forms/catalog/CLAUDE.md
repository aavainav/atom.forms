# `@forms/catalog`

The registry of forms available for data-driven rendering, keyed by **name + version**. Four source files; the
whole package is one service and one shrub module.

## Files

| Path | Contents |
| --- | --- |
| [src/module.ts](src/module.ts) | `FormCatalogModule` + `IFormCatalogConfiguration` (`registerCatalogItem`). Registers `FormCatalogService` under both service interfaces via one `SingletonServiceFactory`. |
| [src/services/form-catalog.ts](src/services/form-catalog.ts) | `IFormCatalogItem`, `IFormComponentProps`, `IFormCatalogService` (read), `IFormCatalogRegistrationService` (write), and the `FormCatalogService` implementing both. |
| [src/services/index.ts](src/services/index.ts) · [src/index.ts](src/index.ts) | Barrels. |

## `IFormCatalogItem` — what a form registers

```ts
{ name, description, version,
  ctor:        FormModelConstructor<TForm>,     // creates and builds the initial model
  schema:      SchemaConstructor<TSchema>,      // the definition tree
  formFactory: FormFactoryConstructor<TForm>,   // creates the form and additional pages
  component:   () => Promise<ComponentType<IFormComponentProps>> }  // lazily imported
```

`IFormComponentProps` is `{ controllers: IControllerManager, isReadOnly: boolean }` — the contract every form's
root component implements.

## The one design rule

**A catalog item holds form *definition* data only. Data mapping is not the catalog's business** — mappers live in
`@forms/report-viewer` (`IReportViewerConfiguration.registerMapper`). If you find yourself wanting a mapper, a data
shape or a persistence hook on `IFormCatalogItem`, it belongs in the report viewer's service layer instead.

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
new MyFormSchema();
config.get<IFormCatalogConfiguration>(IFormCatalogConfiguration).registerCatalogItem({
    name, description, version,
    ctor: MyFormModel, schema: MyFormSchema, formFactory: MyFormFactory,
    component: () => import("./components").then(m => m.MyForm)
});
```

The `name`/`version` pair used here must match the one passed to `registerMapper` — the report viewer keys mappers
on the resolved catalog item's identity, and a mismatch shows up as a form that silently neither populates nor saves.

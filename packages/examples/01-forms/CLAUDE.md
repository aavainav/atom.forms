# `01-forms` — the forms sandbox

The standalone app the forms stack is developed against. It is a **host**, not a library, and it supplies the three
things the stack leaves to whoever embeds it: a list of bootstrappers to load, a **route** per form, and an
`IDataManager` per record. It adds a home page and two demo routes of its own.

Nothing depends on this package. It is the top of the graph, so anything here can be changed freely.

Run it with `yarn dev-forms` from the repo root (vite, port 3002, `strictPort`). Build with `yarn build-forms`, which
runs `tsc -b && vite build` here after lerna has built every package it depends on.

## Files

| Path | Contents |
| --- | --- |
| [index.html](index.html) | The vite entry document. Its `<script src>` must match the entry file's name. |
| [src/main.ts](src/main.ts) | The app's startup: one `WorkbenchBootstrapper.start` call listing every bootstrapper. **The file every new form is registered in.** |
| [src/form-routes.ts](src/form-routes.ts) | `formRoutes` — identity → path for every catalog form this app routes to. Read twice: to register the routes, and by the home page to build its menu. |
| [src/forms/](src/forms/) | `FormsModule` registers one route per `formRoutes` entry, all pointing at `form-route-page.tsx` — **the one route component every catalog form is rendered by.** |
| [src/example-data.ts](src/example-data.ts) | The host data boundary: `createExampleDataManager(identity, searchParams)`, the fixture-per-identity table, and the sessionStorage round trip. A plain function, not a module or a service. |
| [src/home/](src/home/) | The index route at `/`: `HomeModule` registers it, `home-page.tsx` renders it. |
| [src/mock-citation-data.ts](src/mock-citation-data.ts) · [mock-ga-utc-data.ts](src/mock-ga-utc-data.ts) · [mock-public-contact-or-warning-data.ts](src/mock-public-contact-or-warning-data.ts) · [mock-tr310-data.ts](src/mock-tr310-data.ts) | The fixtures, each written in its own form's published data contract. Each exports a `Record<string, T>` keyed by scenario: `full` and `minimal`. |
| [src/demos/dropzone/](src/demos/dropzone/) | `/demo/dropzone` — drags mock person/vehicle records onto the public contact/warning form's dropzones. |
| [src/demos/watermark/](src/demos/watermark/) | `/demo/watermark` — the watermark each `FormStatus` stamps, and that a form carries one only while read-only. |
| [vite.config.ts](vite.config.ts) | Port 3002, react plugin, and the Sass deprecation categories silenced for Bootstrap 5.3. |

## Routes

| Path | Rendered by | Registered in |
| --- | --- | --- |
| `/` | `HomePage` — the index route | [src/home/home-module.ts](src/home/home-module.ts) |
| `/ga/utc` · `/ok/parking` · `/ok/traffic` · `/sc/432` · `/sc/s438` · `/sc/tr310` | **one** `FormRoutePage`, resolving its identity from the matched path | [src/forms/forms-module.ts](src/forms/forms-module.ts) |
| `/demo/dropzone` · `/demo/watermark` | the demo pages | [src/demos/](src/demos/) |
| `*` | `NotFound` | `@forms/workbench` |

Every route is a **child** of the workbench's `"app"` root route, registered through
`IWorkbenchConfiguration.registerRoute` — the same generic call for a form route, the home page and a demo.

**Six form loaders became one route component.** A form package registers nothing but its catalog item now, so
there is no such thing as a form-specific loader: the report viewer takes an identity and a data manager as props
and does the resolving, building and populating itself. All `FormRoutePage` does is look its path up in
`formRoutes` and render:

```tsx
<ReportViewer identity={route.identity} dataManager={createExampleDataManager(route.identity, searchParams)} settings={{ showOptions: true }} />
```

## The home page

`/` lists every catalog form and demo as a link into its route. It reads `IFormCatalogService.getLatestVersions()`
for the title, description and version and joins each against [src/form-routes.ts](src/form-routes.ts). A catalog
form with no entry there is still listed, greyed out and marked "no route registered", so registering a form's
bootstrapper without adding a route shows up as a visible gap rather than a silently missing row.

Each form also lists **the options its report viewer offers**, from `IReportViewerService.getOptions(catalogItem)`
— the same call the options bar renders from, so the badges here and the buttons there cannot disagree. It is the
quickest way to see a per-form gate working: the four citations list Violations and the TR-310 and Form 432 do not,
because that option is gated on the catalog item's own `violationListId`.

**Save is absent from the badges on purpose.** Its gate needs a data manager that can write, and only the route
that actually opens a record has one; `getOptions(catalogItem)` with no manager honestly answers "not this list".

Rows are real anchors (`href` set) whose plain click is intercepted and routed with react-router's `useNavigate`, so
the url shows on hover and ctrl/cmd/shift-click still open a new tab, while a plain click routes without reloading.

## The host data boundary — what this package exists to demonstrate

[example-data.ts](src/example-data.ts) is the reference `IDataManager`:

```ts
createExampleDataManager(identity, searchParams): IDataManager | undefined
//   read():  looks `identity` up in the `forms` fixture table, prefers a saved record, stamps the identity
//   write(): puts the extracted data in sessionStorage
```

It is a **plain function**, not a module and not a service: the manager is built where the record is opened (the
route component) and handed to `<ReportViewer />` as a prop, so there is nothing to register and no ordering to get
right. The round trip works with no server:

- the **writer** puts the extracted data in `sessionStorage` under `` `example-data:${name}@${version}` `` — keyed
  by identity, so a record saved for one form is never read back into another;
- the **reader** prefers a saved record over the fixture, so load → edit → save → reload shows the edit.

Query string controls: `?record=full` / `?record=minimal` picks the scenario (`?citation=` is accepted as an alias),
`?record=new` starts from the values a host gives a record that does not exist yet, and `?reset=1` clears the saved
record for that form first.

**There is no separate "defaults" path.** `?record=new` is just a scenario whose values come from the table's
`defaults` entry rather than a fixture — one `read()`, one shape. Two forms have one, which is what shows that
locking follows the keys a host names rather than being wired up per form:

| | pre-filled | locked |
| --- | --- | --- |
| `/sc/432?record=new&reset=1` | agency name, agency city | agency name |
| `/sc/s438?record=new&reset=1` | court name, city, state | court name |

`readOnlyFields` is **typed against each form's own contract** — the table's entries go through a `defineForm<TData>`
helper for exactly that, so a misspelled key is a compile error rather than a lock that silently does nothing.

Fixtures are chosen by **identity**, not by anything in a route context, because a host reading from a real source
already knows which record it is asking for. **A form with no entry in the `forms` table gets no manager at all** —
`ok/parking` and `ok/traffic` render empty and unsaveable rather than quietly borrowing another form's fixture.

## The two demos take the advanced path

Both call `IReportViewerService.loadForm` and render `<ReportViewerForm />` directly rather than `<ReportViewer />`,
because each needs something the three props deliberately don't expose:

- [watermark-demo-page.tsx](src/demos/watermark/watermark-demo-page.tsx) mutates the loaded model (`setStatus`)
  before rendering it;
- [dropzone-demo-page.tsx](src/demos/dropzone/dropzone-demo-page.tsx) owns a `ControllerManager` so its
  outside-the-form `FDraggableItem`s share the form's `DragAndDropController`.

That is the intended escape hatch, and it is exactly what `ReportViewer` does internally.

## Gotchas

- **`/` is this package's to claim.** `@forms/workbench` registers the `"app"` root at `/` but nothing as its index.
  `addChildRoute` only appends, so there is no displacing a route that is already there.
- **`/ok/parking` and `/ok/traffic` have no fixtures**, so they render empty and offer no Save. Add an entry to the
  `forms` table in [src/example-data.ts](src/example-data.ts) when those forms get fixtures.
- **The entry file is `src/main.ts`, not `.tsx`** — it contains no JSX. [index.html](index.html) names it explicitly,
  so renaming it means editing both.
- Bootstrap 5 utility classes are used directly here, not `@common/ui`. The theme is not imported by any file in this
  package: `@forms/report-viewer`'s `report-viewer.tsx` carries the one
  `import "@forms/core/theme/_main.scss"` in the graph.

## Recipes

**Add a form to the sandbox** — two or three steps, all in this package:

1. import its bootstrapper in [src/main.ts](src/main.ts) and add it to the `bootstrappers` array (kept alphabetical
   — order doesn't otherwise matter);
2. add its identity and path to `formRoutes` in [src/form-routes.ts](src/form-routes.ts). That both registers the
   route and makes the home page list it as reachable; no new component is needed;
3. optionally add a fixture module and an entry in the `forms` table in [src/example-data.ts](src/example-data.ts)
   so the form loads with data and can be saved.

**Add a demo route**: copy [src/demos/watermark/](src/demos/watermark/) — module, page, barrel — change the path, and
register the bootstrapper in [src/main.ts](src/main.ts).

**Add a fixture scenario**: add a key alongside `full`/`minimal` in the form's mock data module and reach it with
`?record=<key>`. An unknown key falls back to `full`.

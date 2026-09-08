# `02-forms` — the forms sandbox

The standalone app the forms stack is developed against. It is a **host**, not a library: it supplies the two things
`@forms/report-viewer` leaves to whoever embeds it — a list of bootstrappers to load, and the data reader/writer pair
behind the host data boundary — and adds a home page and two demo routes of its own.

Nothing depends on this package. It is the top of the graph, so anything here can be changed freely.

Run it with `yarn dev-forms` from the repo root (vite, port 3002, `strictPort`). Build with `yarn build-forms`, which
runs `tsc -b && vite build` here after lerna has built every package it depends on.

## Files

| Path | Contents |
| --- | --- |
| [index.html](index.html) | The vite entry document. Its `<script src>` must match the entry file's name. |
| [src/main.ts](src/main.ts) | The app's startup: one `WorkbenchBootstrapper.start` call listing every bootstrapper and the module settings. **The file every new form is registered in.** |
| [src/home/](src/home/) | The `/home` route: `HomeModule` registers it, `home-page.tsx` renders it. |
| [src/example-data-module.ts](src/example-data-module.ts) | The host data boundary — the `IFormDataReader`/`IFormDataWriter` pair, the fixture-per-route table, and the sessionStorage round trip. |
| [src/mock-citation-data.ts](src/mock-citation-data.ts) · [mock-public-contact-or-warning-data.ts](src/mock-public-contact-or-warning-data.ts) · [mock-tr310-data.ts](src/mock-tr310-data.ts) | The fixtures, each written in its own form's published data contract (`IS438Data`, `IPublicContactOrWarningData`, `ITR310Data`). Each exports a `Record<string, T>` keyed by scenario: `full` and `minimal`. |
| [src/demos/dropzone/](src/demos/dropzone/) | `/demo/dropzone` — drags mock person/vehicle records onto the public contact/warning form's dropzones. |
| [src/demos/watermark/](src/demos/watermark/) | `/demo/watermark` — the watermark each `FormStatus` stamps, and that a form carries one only while read-only. |
| [vite.config.ts](vite.config.ts) | Port 3002, react plugin, and the Sass deprecation categories silenced for Bootstrap 5.3. |

## Routes

| Path | Rendered by | Registered in |
| --- | --- | --- |
| `/` | `ReportViewerLoader` — resolves the form from whatever the data reader returns | `@forms/report-viewer` |
| `/home` | `HomePage` | [src/home/home-module.ts](src/home/home-module.ts) |
| `/ga/utc` · `/ok/parking` · `/ok/traffic` · `/sc/432` · `/sc/s438` · `/sc/tr310` | each form package's `*FormLoader`, pinned to one `CATALOG_IDENTITY` | the form packages |
| `/demo/dropzone` · `/demo/watermark` | the demo pages | [src/demos/](src/demos/) |
| `*` | `NotFound` | `@forms/report-viewer` |

Every route here is a **child** of the report viewer's `report-viewer` layout route, but registered through one of
two seams: a **form package** declares its route as part of `IReportViewerConfiguration.registerForm({ name, version,
route })`, so the route and the catalog identity are registered together; the three non-form modules in this package
([home](src/home/home-module.ts), [dropzone](src/demos/dropzone/dropzone-demo-module.ts),
[watermark](src/demos/watermark/watermark-demo-module.ts)) use `registerRoute("report-viewer", …)` and are the same
eighteen lines with a different path and lazy import — copy one to add another.

## The home page

`/home` lists every form and demo as a link into its route, and **hardcodes nothing about the forms**. It joins two
registries on the form's name at render time: `IFormCatalogService.getLatestVersions()` (whose only caller this is)
for the title, description and version, and `IReportViewerService.getForms()` for the route each form registered
through `registerForm`. A catalog form the report viewer has no registration for is still listed, greyed out and
marked "no route registered", so registering a form's bootstrapper without registering its route shows up as a
visible gap rather than a silently missing row.

Registered paths are relative (`sc/tr310`) because every form route is a child of the report viewer's layout route
at `/`; `getLinkPath` in [home-page.tsx](src/home/home-page.tsx) makes them absolute for the anchor.

Rows are real anchors (`href` set) whose plain click is intercepted and handed to `INavigationService.navigateTo`, so
the url shows on hover and ctrl/cmd/shift-click still open a new tab, while a plain click routes without reloading.

## The host data boundary — what this package exists to demonstrate

[example-data-module.ts](src/example-data-module.ts) is the reference implementation of the reader/writer pair. The
round trip works with no server:

- the **writer** puts the extracted data in `sessionStorage` under `` `example-data:${window.location.pathname}` `` —
  keyed by route, so a record saved for one form is never read back into another;
- the **reader** prefers a saved record over the fixture, so load → edit → save → reload shows the edit.

Query string controls: `?record=full` / `?record=minimal` picks the scenario (`?citation=` is accepted as an alias),
and `?reset=1` clears the saved record for that route first.

Fixtures are chosen **by route**, not from anything in the data context, because a context carries only the matched
route's params and query string and every form route here is a static path with neither. A host reading from a real
source already knows which record it is asking for.

## Gotchas

- **`/` is not the home page.** `@forms/report-viewer` registers `/`'s index route in its own `configure`, before
  `await next()`, and `addChildRoute` only appends — so a host module cannot displace it. That is why the home page
  lives at `/home`. Changing this means changing `@common/react-router` and `@forms/report-viewer`, not this package.
- **`getForm()` falls back to the last fixture entry** for any unmatched route, which is what keeps `/` rendering a
  form at all. The cost is that `/ok/parking` and `/ok/traffic`, which have no fixtures, are handed S438 data their
  pinned `CATALOG_IDENTITY` has no mapper for, so they render blank. Add an entry to the `forms` table when those
  forms get fixtures.
- **The entry file is `src/main.ts`, not `.tsx`** — it contains no JSX. [index.html](index.html) names it explicitly,
  so renaming it means editing both.
- Bootstrap 5 utility classes are used directly here, not `@common/ui`. The theme is not imported by any file in this
  package: the parent `report-viewer` layout route lazy-loads the `@forms/report-viewer` `./components/` barrel, which
  pulls in `report-viewer-panel.tsx` and with it `@forms/core/theme/_main.scss`.

## Recipes

**Add a form to the sandbox** — two steps, both in this package:

1. import its bootstrapper in [src/main.ts](src/main.ts) and add it to the `bootstrappers` array (kept alphabetical).
   The home page picks the form up from there — it lists whatever the catalog and the report viewer hold, so there is
   no table to edit;
2. optionally add a fixture module and an entry in the `forms` table in
   [src/example-data-module.ts](src/example-data-module.ts) so the form loads with data.

**Add a demo route**: copy [src/demos/watermark/](src/demos/watermark/) — module, page, barrel — change the path, and
register the bootstrapper in [src/main.ts](src/main.ts).

**Add a fixture scenario**: add a key alongside `full`/`minimal` in the form's mock data module and reach it with
`?record=<key>`. An unknown key falls back to `full`.

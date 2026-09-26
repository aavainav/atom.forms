# `01-forms` — the forms sandbox

The standalone app the forms stack is developed against. It is a **host**, not a library, and it supplies the three
things the stack leaves to whoever embeds it: a list of bootstrappers to load, a **route** per form, and an
`IReportViewerDataManager` per record. It adds a home page and two demo routes of its own.

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
| [src/example-data.ts](src/example-data.ts) | The host data boundary: `createExampleDataManager(identity, searchParams, setSearchParams, keepsHistory)`, the fixture-per-identity table, and the sessionStorage round trip. A plain function, not a module or a service. |
| [src/example-held-reports.ts](src/example-held-reports.ts) · [example-actors.ts](src/example-actors.ts) | The report each form holds for `?record=held`: its own id, status, workflow history, audit history and comments, told for one person or another. And the Futurama actors (Fry the officer, Hermes the reviewer, Judge Whitey) the stories, the sandbox pages and the workflow demo share. |
| [src/home/](src/home/) | The index route at `/`: `HomeModule` registers it, `home-page.tsx` renders it. |
| [src/mock-citation-data.ts](src/mock-citation-data.ts) · [mock-ga-utc-data.ts](src/mock-ga-utc-data.ts) · [mock-public-contact-or-warning-data.ts](src/mock-public-contact-or-warning-data.ts) · [mock-tr310-data.ts](src/mock-tr310-data.ts) | The fixtures, each written in its own form's published data contract. Each exports a `Record<string, T>` keyed by scenario: `full` and `minimal`. |
| [src/demos/audit/](src/demos/audit/) | `/demo/audit` — the S438 form beside a live log of what `@forms/audit` records as it is worked on. |
| [src/demos/dropzone/](src/demos/dropzone/) | `/demo/dropzone` — drags mock person/vehicle records onto the public contact/warning form's dropzones. |
| [src/demos/form-mode/](src/demos/form-mode/) | `/demo/form-mode` — how a form's `FormMode` changes what's on screen: fields disabling, placeholders disappearing, and the watermark each `FormStatus` stamps. |
| [src/demos/workflow/](src/demos/workflow/) | `/demo/workflow` — a crash report (TR-310) moved from draft to approved by an officer and then a reviewer, and a citation (S438) from draft to issued. See *The workflow demo* below. |
| [src/demos/review/](src/demos/review/) | `/demo/review` — a reviewer comments on the public contact/warning form and an officer resolves the comments, both working from the same comments and audit history, held in memory the way a host's database would hold them. |
| [vite.config.ts](vite.config.ts) | Port 3002, react plugin, and the Sass deprecation categories silenced for Bootstrap 5.3. |

## Routes

| Path | Rendered by | Registered in |
| --- | --- | --- |
| `/` | `HomePage` — the index route | [src/home/home-module.ts](src/home/home-module.ts) |
| `/ga/utc` · `/ok/parking` · `/ok/traffic` · `/sc/432` · `/sc/s438` · `/sc/tr310` | **one** `FormRoutePage`, resolving its identity from the matched path | [src/forms/forms-module.ts](src/forms/forms-module.ts) |
| `/demo/audit` · `/demo/dropzone` · `/demo/form-mode` · `/demo/review` · `/demo/workflow` | the demo pages | [src/demos/](src/demos/) |
| `*` | `NotFound` | `@forms/workbench` |

Every route is a **child** of the workbench's `"app"` root route, registered through
`IWorkbenchConfiguration.registerRoute` — the same generic call for a form route, the home page and a demo.

**Six form loaders became one route component.** A form package registers nothing but its catalog item now, so
there is no such thing as a form-specific loader: the report viewer takes an identity and a data manager as props
and does the resolving, building and populating itself. All `FormRoutePage` does is look its path up in
`formRoutes` and render:

```tsx
<ReportViewer key={searchParams.get("load") ?? undefined} identity={route.identity} dataManager={createExampleDataManager(route.identity, searchParams, setSearchParams, true)} settings={{ showOptions: true, user: fry }} />
```

The user is **Fry, the officer**, so the workflow buttons and the audit's `by` are live on every form page. The
`key` is the nonce "Load test data" sets, since the viewer only reads its record as it mounts (see below).

## The home page

`/` lists every catalog form and demo as a link into its route. It reads `IFormCatalogService.getLatestVersions()`
for the title, description and version and joins each against [src/form-routes.ts](src/form-routes.ts). A catalog
form with no entry there is still listed, greyed out and marked "no route registered", so registering a form's
bootstrapper without adding a route shows up as a visible gap rather than a silently missing row.

Beneath each form it lists the templates the host offers for starting one, indented, as links to `?template=<id>`
(asked of the same data manager the form's route uses, through `readTemplates`). The form's own row starts the default
template, or, for a form with none, `?record=new`; a default is therefore not listed a second time.

**It does not preview a form's options.** `getLatestVersions()` deliberately never constructs a form or calls its
catalog item's `load()`, so nothing about a form's `mapper`/`violationListId` — which the options bar's gates now
read off the constructed form instance, not the catalog item — is knowable from this listing alone. Answering that
here would mean either loading every registered form's code just to render badges, or reintroducing a catalog-level
declaration the rest of the stack deliberately moved away from; the home page just lists what's registered instead.

Rows are real anchors (`href` set) whose plain click is intercepted and routed with react-router's `useNavigate`, so
the url shows on hover and ctrl/cmd/shift-click still open a new tab, while a plain click routes without reloading.

## The host data boundary — what this package exists to demonstrate

[example-data.ts](src/example-data.ts) is the reference `IReportViewerDataManager`:

```ts
createExampleDataManager(identity, searchParams): IReportViewerDataManager | undefined
//   read():  looks `identity` up in the `forms` fixture table, prefers a saved record, stamps the identity
//   write(): puts the extracted data in sessionStorage
```

It is a **plain function**, not a module and not a service: the manager is built where the record is opened (the
route component) and handed to `<ReportViewer />` as a prop, so there is nothing to register and no ordering to get
right. The round trip works with no server:

- the **writer** puts the extracted data in `sessionStorage` under `` `example-data:${name}@${version}` `` — keyed
  by identity, so a record saved for one form is never read back into another;
- the **reader** prefers a saved record over the fixture, so load → edit → save → reload shows the edit. It hands the
  saved `status` and `workflow` back beside the record, so a form saved after it was issued reloads locked, with its history.

Query string controls: `?record=full` / `?record=minimal` picks the scenario (`?citation=` is accepted as an alias),
`?record=new` starts a new report from the form's default template (below), `?template=<id>` starts one from a named
template, `?record=held` is the report the host has been keeping (below), and `?reset=1` clears the saved record for
that form first.

**A held report is a report with a past.** Each form has one to tell in [example-held-reports.ts](src/example-held-reports.ts):
the full fixture under its own `id` and `revision`, the status it stands at, the workflow history that got it there, the
audit history of the people who worked on it and, where the status allows, their comments. The report viewer is
handed all of it in the one `read()`, so opening it says the form was **loaded** -- with how much came with it --
shows the history in the report data dialog, and restores the status and its lock. Each form tells the story its
workflow can:

| Form | Held as | What it carries |
| --- | --- | --- |
| TR-310 | `rejected` | Fry wrote and submitted it, Hermes rejected it with a comment that is still open: 13 audit records, 2 workflow entries, 1 comment |
| S438 | `issued` | Fry wrote, validated and issued it, which closed what a citation charges: 7 audit records, 1 workflow entry |
| GA UTC | `draft` | Started and saved: 4 audit records |
| SC 432 | `draft` | Started and saved: 4 audit records |

**Comments only belong to a report in review or sent back**, so only the crash report has any: a draft never has
comments, and a citation or a warning goes from draft to issued without being reviewed.

With `keepsHistory` (the form route page asks for it) the manager also has `writeAudit` and `writeComments`, which
store the history and the comments in `sessionStorage` beside the record, so a report the host has held shows them and
what is done to it is added to them. A host that can keep comments makes the review option appear on an editable form,
which is how the officer reads and resolves a reviewer's comment. The other demos leave it off.

**"Load test data" is a real reload.** It clears what was saved for the form, then sets `?record=held` and a `load`
nonce; the route page keys the viewer on the nonce so it mounts again and reads the record the way it always does. It
cannot fill the open form in place, because the audit would record that as edits and infer the loaded workflow
history as transitions made now. It offers itself only on a form route, since a demo page does not key on the nonce.

**There is no separate "defaults" path; there are templates.** A new report starts from a **template** the host
offers, through the same `read()` and the same shape as any record. The table's entries each carry `presets` -- reusable
pieces of data -- and `templates`, and a template is the presets it names, laid down in order, and then its own data
on top. `resolveTemplate` puts one together, and the report viewer is handed only the finished record: composing
is the host's business, so this file is the reference for how a host might, not a thing the viewer does for it.

- **The one flagged `isDefault` replaces the form's own default**, and is what `?record=new` and the New Form option
  start from. It is where a settled value is locked for every report. Two forms have one, which is what shows that
  locking follows the keys a host names rather than being wired up per form:

  | | default template | pre-filled | locked |
  | --- | --- | --- | --- |
  | SC 432 (`/sc/432?record=new&reset=1`) | Public contact, from the `columbia-pd` preset | agency name, agency city | agency name |
  | S438 (`/sc/s438?record=new&reset=1`) | Citation, from the `columbia-court` preset | court name, city, state | court name |

- **A form with no default template starts as the form makes it** -- today's date, a ticket number -- which is the
  form's own default, built in and needing nothing from a host. TR-310 and GA UTC are like that.
- **The other templates are what the officer chooses between.** S438 has Speeding, 15 over and Failure to stop at a stop
  sign; SC 432 has Speeding stop and Motorist assistance; TR-310 has a rear-end collision and one in the rain, each
  **built wholly from presets** to show a template needing no data of its own; GA UTC has one built from data alone, to
  show composition is optional. `readTemplates` lists them without their data, which comes with `read("new", id)`.
- **They are reached three ways:** the home page lists each form's templates beneath it, as links to `?template=<id>`,
  which the route page hands `ReportViewer` as its `template` prop; the New Form option opens the picker whenever a form
  has more than one thing to start from; and a URL is stamped with `?record=new&template=<id>` when a new form is
  started, so a refresh starts from the same one. "Load test data" drops the `template` param, since a viewer given one
  starts a new report from it instead of opening the held one.

**The same presets are what an officer applies to a report already under way**, from the Presets button in the options
bar (`readPresets` lists the officer's own first, then the form's). Applying one fills in what the report has not
answered, and it never touches a field the host locked -- so applying `columbia-pd` to a report whose agency name is
locked changes the city and leaves the name. TR-310 has a preset that sets **more than one page**: `mv-and-pedestrian`
gives the vehicle its unit page and its driver and a pedestrian their person pages, each list paired with the report's
by position (the pedestrian is a person page, as the fixtures have it). The template of the same name is that preset
and nothing else.

**An officer can save a preset from the report**, on any form with a manager, through `writePreset` and `deletePreset`.
They are kept in `sessionStorage` under a key of their own (`example-data:<name>@<version>:presets`) that
`clearExampleData` never touches, since they belong to the officer and not to the report: "Start over" and "Load test
data" leave them be. Each is marked `isPersonal` as it is kept, which is what lists it under "My presets".

`readOnlyFields` is **typed against each form's own contract** — the table's entries go through a `defineForm<TData>`
helper for exactly that, so a misspelled key is a compile error rather than a lock that silently does nothing.

Fixtures are chosen by **identity**, not by anything in a route context, because a host reading from a real source
already knows which record it is asking for. **A form with no entry in the `forms` table gets no manager at all** —
`ok/parking` and `ok/traffic` render empty and unsaveable rather than quietly borrowing another form's fixture.

## The audit demo takes the short path

[audit-demo-page.tsx](src/demos/audit/audit-demo-page.tsx) renders a plain `<ReportViewer />`. It needs no controllers,
because a host only subscribes to `IAuditService`; [audit-log.tsx](src/demos/audit/audit-log.tsx) does that in an
effect and lists each record, newest first, with its raw JSON one click away. Records carry field paths and identity,
never values, so that is all the log can show. Edit a field and wait about 1.5s for `fields-edited`; Validate, Print,
Save and New Form raise the rest.

**A save the host performs itself is not audited.** `FormRoutePage`'s leave-the-page prompt writes through the data
manager directly, and on the short path a host has no controller to report it to, so it produces no `saved` record.
Saves through the options bar do.

## The review demo is the host side of loading and writing back

[review-demo-page.tsx](src/demos/review/review-demo-page.tsx) renders a plain `<ReportViewer />`, and its data manager is
the one place the example shows a host **keeping** what the viewer hands it. The comments and the audit history live in
`useRef`s standing in for a database. `read()` returns them with the record, in the one object; `writeComments`
replaces the comments; `writeAudit` appends the new records **by id**, as a real host should. It also has `read()` say the
report is **in review**, the only status a reviewer can comment in. Switching role remounts
the viewer (the mode is applied as the form loads), and the comments and history survive it -- which is what shows they
came back through `read()`. The user fields -- name, badge ID, rank and agency -- become the `settings.user` the records and comments are
attributed to, so the whole actor can be seen on the Audit history and Comments tabs of the report data dialog.

## The workflow demo moves a report once per session

A report reaches the viewer in one status and leaves in another, moved once, so [workflow-demo-page.tsx](src/demos/workflow/workflow-demo-page.tsx)
does not move a report through its whole life in one go: it keeps the report the way a host's database would, and the
user **opens it again** as each person in turn. The page shows what the host holds -- the status, the workflow history
with who moved it and when, and how many comments and audit records -- and says who should open it next.

- **Form**: the crash report (TR-310: submit, then approve or reject with a comment) or the citation (S438: issue).
  Changing it starts a new report.
- **Arrives as**: the status a report the host has not kept yet arrives in -- draft, in progress or in review for a
  crash report, draft or issued for a citation. It goes into `read()` as `status`; a report the host *has* kept carries
  its own. Changing it starts over.
- **Open it as**: the officer (`"editable"`), the reviewer (`"reviewable"`) or a viewer (`"viewable"`), each with an
  actor of their own, so the history shows different people. Switching remounts the viewer, which reads the report as it
  now stands from the host.

The data manager wraps `createExampleDataManager` with the full fixture (a blank report has validation errors that stop
every move), and adds what the example manager leaves to a real host: `write` also tells the page what was kept, and
the audit and comments live in refs. `clearExampleData(identity)` empties the sessionStorage record on Start over --
the `?reset=1` param cannot be used for it, since that clears the record on every read, which would wipe a move as
soon as the role changed.

## The other two demos take the advanced path

Both call `IReportViewerService.loadForm` and render `<ReportViewerForm />` directly rather than `<ReportViewer />`,
because each needs something the three props deliberately don't expose:

- [form-mode-demo-page.tsx](src/demos/form-mode/form-mode-demo-page.tsx) mutates the loaded model (`setStatus`)
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

**Add a demo route**: copy [src/demos/form-mode/](src/demos/form-mode/) — module, page, barrel — change the path, and
register the bootstrapper in [src/main.ts](src/main.ts).

**Add a fixture scenario**: add a key alongside `full`/`minimal` in the form's mock data module and reach it with
`?record=<key>`. An unknown key falls back to `full`.

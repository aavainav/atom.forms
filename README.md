# atom.forms

A form engine for law-enforcement paper forms, and the forms themselves.

A citation or a collision report is a printed document with a fixed layout, a defined set of boxes, and rules
about what may go in them. This repository models that directly: a **definition** tree describes the shape of a
form, an **entity** tree holds its values, and a form package renders the result to look like the paper it stands
in for — so what an officer fills in on screen is recognisably the form they would otherwise fill in by hand.

Six forms across three states are implemented today, along with the engine, the registries they draw on, and a
sandbox app to run them in.

## Quick start

```bash
yarn bootstrap     # install (yarn workspaces)
yarn build         # tsc -b across every package
yarn dev-forms     # the sandbox app on http://localhost:3002
```

The sandbox home page lists every registered form. Open one and you get the real thing: the form rendered, a
floating options bar to validate, review, manage violations and presets, view the data, print, and toggle the theme, and workflow actions above the form to save and transition between statuses.

### Sandbox demo — https://atom-forms.netlify.app/

The forms sandbox is deployed live at **https://atom-forms.netlify.app/** and updates on every merge to `main`.

### Routes

| Route | Form | What it is |
| --- | --- | --- |
| `/` | Home | Lists all available forms and routes. Disabled forms (under construction) are noted. |
| `/sc/s438` | S438 Citation Form | South Carolina uniform traffic citation with support for court and trial variants. |
| `/sc/tr310` | SC TR-310 | South Carolina traffic collision report — the largest form in the catalog. |
| `/sc/432` | SC Form 432 | South Carolina public contact or warning form. |

The following forms are registered in the catalog but deliberately not routed (under construction):

- GA Uniform Traffic Citation (`/ga/utc`)
- OKC Parking Violation (`/ok/parking`)
- OKC Traffic Citation (`/ok/traffic`)

## Layout

A yarn-workspaces monorepo of 19 packages, with lerna as the task runner. Nothing is published; every package is
`private`.

| Package | What it owns |
| --- | --- |
| [`@forms/core`](packages/forms/core/) | The engine. Definition/entity trees, field models, validation, the controllers that hold mutable state, and the `F*` React components. |
| [`@forms/catalog`](packages/forms/catalog/) | The registry of forms, keyed by name and version. Definition data only. |
| [`@forms/report-viewer`](packages/forms/report-viewer/) | Loads a catalog form, populates it from host data, renders it, saves it back. Owns routing, modals, notifications and the mapper registry. |
| [`@forms/value-lists`](packages/forms/value-lists/) | The registry and code generator for the lists behind option fields, plus the national ones. |
| [`@forms/violations`](packages/forms/violations/) | The registry of violations a citation is written for, plus the selector that puts them on a form. |
| [`@forms/printing`](packages/forms/printing/) | The copies a form publishes, the print dialog and the `@page` rules. No PDF library — a print stylesheet and `window.print()`. |
| [`@forms/audit`](packages/forms/audit/) | Records what happens to a form (opened, edited, validated, printed, saved) as typed records a host subscribes to. Field paths and identity only, never values. |
| [`@forms/workbench`](packages/forms/workbench/) | Standalone app host: React root, router, bootstrapper. |
| `packages/forms/<state>/<form>/` | One package per form. Six of them. |
| `packages/common/*` | `@common/event-emitter`, `@common/react`, `@common/react-router`, `@common/zod`. |
| [`packages/examples/01-forms`](packages/examples/01-forms/) | The sandbox app. Mock data, demo pages, and the `main.ts` that bootstraps every module. |

Dependencies point one way and nothing points back up:

```
core  ←  catalog  ←  report-viewer  ←  workbench
  ↑         ↑             ↑    ↑  ↑      ↑
  │         │             │  printing    │
  │         │             │  violations  │
  │         │             │  audit       │
  └─────────┴─────value-lists──┴──┴──────┴───── form packages
```

`printing` and `violations` sit above the report viewer and below the forms. Neither is imported by the report
viewer: each registers its own button through `registerOption`, which is why a form package can gain printing or a
violation selector without the report viewer knowing either exists.

`audit` sits alongside them and depends on core alone: the report viewer mounts its recorder, and no form package
depends on it.

## How a form is put together

Every form package is the same five layers, in the same places, so a change in one is a change in all of them in
the same file:

1. **Schema** — one class declaring the whole Form → Page → Section → Field tree.
2. **Models** — a page model per page and a section model per section, each exposing typed accessors.
3. **Components** — one `.tsx` per section model, mirroring the models tree file for file.
4. **Mapping** — the form's own data contract and a hand-written mapper. There is no shared cross-form data model.
5. **Wiring** — the module, the form factory, the services and the value lists.

Two ideas carry most of the weight. **Everything is immutable**: every setter on a form, page, section or field
returns a new instance, so a setter whose result you discard did nothing. And **each form owns its own data
contract**, hand-mapped — the alternative, a generic shape every form is squeezed into, loses exactly the detail
that makes a printed form what it is.

## Dependency injection

Modules and services come from [`@shrub/core`](https://github.com/jjvainav/shrub) (an external dependency, not a
workspace). A module declares its dependencies, registers services in `configureServices`, and contributes to other
modules through their configuration seams in `configure`. Load order is dependencies first, which is what lets a
module register a default that a later one replaces — how a host serves its own value list, or its own violation
codes, in place of a bundled one.

## Scripts

| Command | What it does |
| --- | --- |
| `yarn bootstrap` | `yarn install` |
| `yarn build` | `tsc -b` in every package |
| `yarn build-forms` | Bundles the sandbox app with vite |
| `yarn dev-forms` | The sandbox dev server on port 3002 |
| `yarn preview` | Serves the bundled sandbox |
| `yarn clean` | Removes `dist/` and build info everywhere |

Packages owning generated value or violation lists also have `yarn generate`, which regenerates `src/generated/`
from that package's `data/`. Those emitted modules are committed and must never be edited or statically imported —
each is reached through a dynamic `import()` so its data stays out of the entry chunk.

There is no test runner configured. Verification today is the build plus the sandbox.

## Using the ReportViewer component

`<ReportViewer />` is the top-level component a host app renders to display and edit a form. It resolves the form from the catalog, builds the model, populates it with data, and mounts all available options and panels (validate, review, violations, presets, report data, print, theme toggle) and workflow actions (save, status transitions).

### Basic usage

```tsx
import { ReportViewer, IReportViewerDataManager } from "@forms/report-viewer";

const dataManager: IReportViewerDataManager = {
  read: async (reason, template) => {
    // reason: "open" (load a saved record) or "new" (start a new one)
    if (reason === "open") {
      return {
        data: await fetchSavedRecord(),
        audit: await fetchAuditHistory(),
        comments: await fetchReviewComments(),
      };
    }
    return { data: template ? await fetchTemplate(template) : {} };
  },
  write: async (data) => {
    // Called when the user clicks Save
    await saveToDB(data);
  },
};

<ReportViewer
  identity={{ name: "S438 Citation Form", version: "1.0" }}
  dataManager={dataManager}
  settings={{ showOptions: true, user: { id: "officer-1", name: "Officer Smith" } }}
/>
```

### Props

- **`identity`** (`IFormIdentity`) — The form to load, by name and optionally version. The catalog resolves the latest version when none is named.
- **`dataManager`** (`IReportViewerDataManager`, optional) — Where the record is read from and written back to. Without one, the form renders blank and unsaveable.
- **`settings`** (`IReportViewerSettings`, optional) — How the report renders:
  - `mode?` — Form mode: `"editable"` (default), `"reviewable"`, `"viewable"`, or `"locked"`.
  - `showOptions?` — Show the floating options bar (default: true).
  - `user?` — Who is using the report (`{ id, name }`) — attributed to audit records and review comments.
- **`template?`** (`string`) — Start a new report from a template id instead of opening one.

### The data manager — where your data lives

The `IReportViewerDataManager` is your contract with the form:

```ts
interface IReportViewerDataManager<TData extends object = IReportData> {
  read?(reason: ReadReason, template?: string): Promise<IReadDataResult<TData> | undefined>;
  readTemplates?(): Promise<ReadonlyArray<IReportTemplate>>;
  readPresets?(): Promise<ReadonlyArray<IReportPreset<TData>>>;
  write?(data: IReportData): Promise<void>;
  writeAudit?(records: ReadonlyArray<AuditRecord>): Promise<void>;
  writeComments?(comments: ReadonlyArray<IReviewComment>): Promise<void>;
  writePreset?(preset: IReportPreset<TData>): Promise<void>;
  deletePreset?(id: string): Promise<void>;
}
```

- **`read(reason, template?)`** — Load or start a record. Return the data, optional audit history, and optional review comments. Return `undefined` to load a blank form.
- **`write(data)`** — Save the form's data when the user clicks Save.
- **`writeAudit(records)`** — Append-only: receive only the new audit records (form opened, field edited, validated, saved, etc.).
- **`writeComments(comments)`** — Called when a review comment is added, resolved, or reopened. You get the full list each time.
- **`readTemplates()`**, **`readPresets()`**, **`writePreset()`**, **`deletePreset()`** — Optional. Offer templates for starting new reports and let officers save and reuse field groups.

### What the form offers

The viewer renders:

- **Workflow Actions** (header, always) — Form title, status, Save button, and transition buttons to move between statuses.
- **Validate** — Run the form's rules and show violations and warnings.
- **Review** — Add comments on the form, pages, sections, or fields (when the form is reviewable and comments can be saved).
- **Violations** — Select and apply violations to the citation (citation forms only).
- **Presets** — Save and apply groups of field values (when the host offers presets).
- **Report Data** — View the record's data, audit history, comments, and workflow state as JSON.
- **Print** — Print the form as one of its defined print copies.
- **Day/Night Mode** — Toggle the theme.

See [`packages/forms/report-viewer/CLAUDE.md`](packages/forms/report-viewer/CLAUDE.md) for the complete API and implementation details.

## Documentation

**The real documentation is the `CLAUDE.md` file in each package.** Each carries a file map, the decisions behind
the code and the recipes for common changes, and they are kept current with the source. Read the one for the
package you are working in before opening its files:

- [`packages/forms/CLAUDE.md`](packages/forms/CLAUDE.md) — the map of all the form packages and the conventions
  that hold across them. **Start here.**
- [`packages/forms/report-viewer/CLAUDE.md`](packages/forms/report-viewer/CLAUDE.md) — the ReportViewer component and its API.
- Then the `CLAUDE.md` of whichever package you are in.

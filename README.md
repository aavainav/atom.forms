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
floating options bar in the bottom right to validate, save, print and pick violations, and drag-and-drop targets
for importing a person or a vehicle onto it.

| Route | Form |
| --- | --- |
| `sc/s438` | SC S438 Uniform Traffic Ticket |
| `sc/tr310` | SC TR-310 Traffic Collision Report |
| `sc/432` | SC Form 432 Public Contact / Warning |
| `ok/traffic` | OKC Traffic Citation and Complaint |
| `ok/parking` | OKC Parking Violation |
| `ga/utc` | GA Uniform Traffic Citation (Atlanta) |

## Layout

A yarn-workspaces monorepo of 18 packages, with lerna as the task runner. Nothing is published; every package is
`private`.

| Package | What it owns |
| --- | --- |
| [`@forms/core`](packages/forms/core/) | The engine. Definition/entity trees, field models, validation, the controllers that hold mutable state, and the `F*` React components. |
| [`@forms/catalog`](packages/forms/catalog/) | The registry of forms, keyed by name and version. Definition data only. |
| [`@forms/report-viewer`](packages/forms/report-viewer/) | Loads a catalog form, populates it from host data, renders it, saves it back. Owns routing, modals, notifications and the mapper registry. |
| [`@forms/value-lists`](packages/forms/value-lists/) | The registry and code generator for the lists behind option fields, plus the national ones. |
| [`@forms/violations`](packages/forms/violations/) | The registry of violations a citation is written for, plus the picker that puts them on a form. |
| [`@forms/printing`](packages/forms/printing/) | The copies a form publishes, the print dialog and the `@page` rules. No PDF library — a print stylesheet and `window.print()`. |
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
  └─────────┴─────value-lists──┴──┴──────┴───── form packages
```

`printing` and `violations` sit above the report viewer and below the forms. Neither is imported by the report
viewer: each registers its own button through `registerOption`, which is why a form package can gain printing or a
violation picker without the report viewer knowing either exists.

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

## Documentation

**The real documentation is the `CLAUDE.md` file in each package.** Each carries a file map, the decisions behind
the code and the recipes for common changes, and they are kept current with the source. Read the one for the
package you are working in before opening its files:

- [`packages/forms/CLAUDE.md`](packages/forms/CLAUDE.md) — the map of all the form packages and the conventions
  that hold across them. **Start here.**
- Then the `CLAUDE.md` of whichever package you are in.

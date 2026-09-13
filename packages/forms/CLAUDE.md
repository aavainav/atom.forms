# `packages/forms` — map

Read this before opening files under `packages/forms`. Each package has its own `CLAUDE.md` with a file map and
task recipes; open that one rather than reading the package's source to orient.

## The packages

| Package | Name | What it owns |
| --- | --- | --- |
| [core/](core/) | `@forms/core` | Form model/definition/entity tree, field models, validation rules, controllers, `F*` React components. No shrub module. |
| [catalog/](catalog/) | `@forms/catalog` | Registry of forms by name+version — the source of truth for a form's identity, definition, mapper, and data reader/writer. |
| [value-lists/](value-lists/) | `@forms/value-lists` | Value-list registry + service, the code generator, and the national (jurisdiction-free) lists. |
| [violations/](violations/) | `@forms/violations` | Registry of the violations a citation is written for, plus the selector that puts them on a form. Citations only; bundles no lists of its own. |
| [report-viewer/](report-viewer/) | `@forms/report-viewer` | Renders an already-resolved catalog item, populates it from its own data reader, saves it back. Owns routing, modals, notifications — tracks no form by identity itself. |
| [printing/](printing/) | `@forms/printing` | Printing a form as one of the copies it publishes. Owns the print copies, the print dialog and the `@page` rules; no PDF library. |
| [workbench/](workbench/) | `@forms/workbench` | Standalone app host: react root, router creation, bootstrapper. |
| [south-carolina/s438/](south-carolina/s438/) | `@forms/s438` | SC S438 UTT citation form. |
| [south-carolina/public-contact-or-warning/](south-carolina/public-contact-or-warning/) | `@forms/public-contact-or-warning` | SC Form 432 public contact / warning. |
| [south-carolina/tr310/](south-carolina/tr310/) | `@forms/tr310` | SC TR-310 traffic collision report. The largest form. |
| [oklahoma/parking/](oklahoma/parking/) | `@forms/ok-parking` | OKC parking violation. |
| [oklahoma/traffic/](oklahoma/traffic/) | `@forms/ok-traffic` | OKC traffic citation and complaint. |
| [georgia/utc/](georgia/utc/) | `@forms/ga-utc` | GA uniform traffic citation, summons, and accusation (Atlanta). The checkbox-heavy form. |

Dependency direction (nothing points back up):

```
core  ←  catalog  ←  report-viewer  ←  workbench
  ↑         ↑             ↑    ↑  ↑      ↑
  │         │             │  printing    │
  │         │             │  violations  │
  └─────────┴─────value-lists──┴──┴──────┴───── form packages (south-carolina/*, oklahoma/*, georgia/*)
```

`printing` and `violations` both sit above `report-viewer` and below the form packages: each registers its button
with the report viewer through `registerOption` rather than being imported by it, and a form package depends on
one only to declare what it contributes — the copies it can be printed as, or the violation list it draws on and
how a chosen violation lands on its fields.

## The five layers of a form package

Every form package is the same five layers. Naming and file placement are consistent across all three, so a change
in one is a change in all three in the same places.

1. **Schema** (`src/models/<form>-form-schema.ts`) — one class extending `Schema`. Declares the whole
   Form → Page → Section → Field definition tree via `DefinitionFactory` and `defineFields`. Constructed once in
   `module.ts`; self-registers with `FormModel`.
2. **Models** (`src/models/<page>/…`) — a `PageModel` per page and a `SectionModel` per section, each pulling its
   definitions off the schema and exposing typed `getX()` accessors. Immutable.
3. **Components** (`src/components/<page>/…`) — one `.tsx` per section model, mirroring the models tree file for
   file. Reads via `binding.get()`, writes via `binding.setValue()`.
4. **Mapping** (`src/mapping/`) — the form's own data contract (`I<Form>Data`) and its hand-written `FormMapper`.
5. **Wiring** (`src/module.ts`, `src/form-factory.ts`, `src/services/`, `src/value-lists.ts`, `src/bootstrapper.ts`).

## Conventions that hold everywhere

- **Everything is immutable.** `FormModel`, `PageModel`, `SectionModel`, `FieldModel`, `PageCollection`,
  `RuleCollection`, `RuleIssueCollection`, `Dropzone` all return a new instance from every setter. `withChanges`
  (`core/src/utils/clone.ts`) is the clone helper. A setter whose result you discard did nothing.
- **Class and interface members are alphabetical** within a group (properties, then public methods; abstract and
  `private`/`protected` helpers last). Insert new members at their alphabetical position.
- **Each form owns its data contract and hand-writes its mapper.** No shared cross-form data model, no generic
  mapping. A mapper's `extract`/`populate` pair for a section sit adjacent so a missed field shows in one diff.
- **A form's identity is declared once, as a `CATALOG_IDENTITY` constant beside its form model**, and the model
  assigns it to its own `name`/`description`/`version`. `module.ts` registers the catalog item and its mapper (both
  with `@forms/catalog`) and the route (with `@forms/report-viewer`) from that constant, and the route loader pins
  it — so the identity `extractData` stamps a saved report with is the same one the catalog resolves it by. Never
  write a form's name or version as a literal anywhere else.
- **State is per form instance**, held by `ControllerManager`/`FormController` in the React layer — never attached
  to the immutable `FormModel`.
- **A section declared `{ isShared: true }` holds the same values on every instance of its page.** Every citation
  page repeats once per violation, and the violator, vehicle and officer sections are shared so that only the
  charge differs between pages. A write through a shared section's binding fans out to every page, `addPage` seeds
  a new page from the first, and a rule reading only shared sections is evaluated once rather than once per page.
  Nothing in a section component changes — the flag is on the *definition*.
- **Prefer `@common/event-emitter` over React Context** for cross-component broadcast, and model-owned state plus
  explicit props over Context for things like enabled/read-only.
- **Doc comments are JSDoc `/** */`**, not `//`. Trivial single-field getters are one-liners with no doc comment.
- **Keep new dependencies to a minimum.**
- **Tests live in a package's `test/` directory, not beside the source.** Every package's `tsconfig.json` sets
  `include: ["src"]` and `rootDir: "src"`, so a colocated test would be compiled into `dist/` — the build output
  every other package consumes.
- **A section property cannot be called `name`, `id`, `revision` or `definition`** — `SectionModel` and `Entity`
  already declare those, and a field definition shadowing one is a compile error that cascades through every file
  touching the section. Prefix instead: `officerName`, `witnessName`, `licenseIdentifier`.
- **Where a printed form takes a code but no authoritative code list exists, model it as a text field.** Do not
  invent codes into a `data/*.json` that reads as generated-from-source. Turning it into a coded box later is an
  entry in the form's `value-lists.ts`, a `get*Options` on its service, and a change of constructor in the schema.

## Adding a whole new form — the checklist

1. New package under `packages/forms/<jurisdiction>/<form>/` (copy [s438](south-carolina/s438/) for a
   fixed-page form, [tr310](south-carolina/tr310/) for one with repeating pages,
   [ga-utc](georgia/utc/) for one whose answers are printed rows of checkboxes rather than coded boxes).
2. `package.json` deps: `@forms/catalog`, `@forms/core`, `@forms/report-viewer`, `@forms/workbench`, plus
   `@forms/value-lists` if it has option fields. `tsconfig.json` extends `../../tsconfig.base.json`.
3. Schema → form model and its `CATALOG_IDENTITY` → page/section models → section components → data contract →
   mapper → rules.
4. `form-factory.ts`, `services/`, `options.ts`, `module.ts`, `bootstrapper.ts`, `index.ts`.
5. Register the bootstrapper in `packages/examples/01-forms/src/main.ts`. The sandbox home page lists every catalog
   form automatically; add the form's route to the `formRoutes` table in `src/home/home-page.tsx` so it lists as
   reachable rather than routeless.

## Build

`yarn build-forms` from the repo root (lerna, `tsc -b` per package). Per package: `yarn build`, `yarn clean`.
Value-list packages also have `yarn generate`.

## Test

`yarn test` and `yarn test-types` from the repo root (lerna, one run per package). Per package: `yarn test`,
`yarn test-watch`, `yarn test-types` — Vitest strips types without checking them, so the typecheck is a separate
script, and it is the one that enforces the mapper fixtures described below.

Every package shares [vitest.config.base.mts](vitest.config.base.mts), so a package's own `vitest.config.ts` is one
line. The base resolves every workspace package to its **source** rather than its built `dist/`, so a suite runs on
a fresh clone without `yarn build` first, and it pins `experimentalDecorators` for the `@RegisterRule` and
`@Singleton` classes, whose decorators reference the class being decorated.

Its default environment is `jsdom`, because importing the `@forms/core` barrel loads `@popperjs/core`, which reads
`document` as it is imported — and a form package reaches core through the barrel in every file. [core/](core/),
[value-lists/](value-lists/) and [violations/](violations/) override it to `node`: they import deep source paths and
reach core only for types, so nothing pulls the barrel in. Prefer `node` where a package can manage it; the suite
is roughly five times quicker without a DOM.

A new package adopts tests by copying a one-line `vitest.config.ts`, a `test/tsconfig.json`, and the three scripts.
See [core/CLAUDE.md](core/CLAUDE.md) for the rules a test has to follow to stay clear of the global registries.

**A form package's mapper is tested by a round trip.** `extract(populate(form, data))` must equal `data`, over a
fixture holding a value for **every** field the contract publishes. The fixture is typed `Required<IFormData>`, so
a field added to the contract and forgotten in the fixture fails `yarn test-types` — which is what keeps the round
trip covering the whole contract rather than slowly falling behind it. Every value is distinct and derived from its
own field name, so a mapper writing one field into a neighbouring box fails rather than passes; and every value is
non-empty, because `FormMapper.read` omits an empty field and `""`, `0` and `false` all read as empty. TR-310's
fixture carries 347 fields and was generated from its contract rather than typed by hand.

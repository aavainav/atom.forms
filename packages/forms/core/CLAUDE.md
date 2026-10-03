# `@forms/core`

The form engine: the definition/model tree, field models, validation, the controllers that own mutable state, and
the `F*` React components. Depends on `@common/event-emitter`, bootstrap, popper and zod. **It is not
a shrub module** — it registers no services and has no `module.ts`.

Everything is exported from [src/index.ts](src/index.ts); consumers only ever import `@forms/core`.

## The two parallel trees

The single idea in this package: a **definition** tree describes shape, an **entity** tree holds values, and the
two are linked by a global registry keyed on constructor.

```
FormDefinition ── PageDefinition ── SectionDefinition ── FieldDefinition      (shape, built once by a Schema)
FormModel      ── PageCollection ── PageModel ── SectionModel ── FieldModel   (values, immutable, rebuilt per edit)
                                     ^ a PageDefinition maps to a PageCollection, which holds 0..n PageModels
```

- `Entity` holds a `Map<ChildDefinition, value>`. `entity.get(definition)` reads it; `entity.set(definition, value)`
  returns a **new** entity. `Entity.set` throws if the definition is not a child of this entity's definition.
- A definition's constructor registers the model constructor → definition in `Entity.definitionRegistry`, which is
  how `new SomePageModel()` resolves its own definition with no arguments. This registry is **static and global**,
  so a model constructor may back exactly one definition. It is the one registry considered legitimate to keep,
  since it resolves an entity's own identity — needed because `Entity.create()` does a bare `new ctor()` with
  nothing else to go on — rather than data *about* an already-known identity.
- **There is no separate schema registry.** `FormModel.getSchema<TSchema>(ctor)` resolves a schema by walking the
  *definition* tree: `Entity.resolveDefinition(ctor)` finds the constructor's own definition in
  `Entity.definitionRegistry`, then walks its `.parent` chain up to the root `FormDefinition`, which carries a
  `schema` field set when it was constructed. `Schema`'s own constructor does nothing — a schema is discoverable
  because the definition tree it built already leads back to it, not because it registered itself anywhere.
- `FormModel.dispose()` clears `Entity.definitionRegistry` — it tears down every form in the process, not just one.

## File map

| Path | Contents |
| --- | --- |
| [src/models/definition.ts](src/models/definition.ts) | `Definition` base: `id` (uuid), `name`, `valueType` ctor, `parent`, `children`. |
| [src/models/form-definition.ts](src/models/form-definition.ts) · [page-definition.ts](src/models/page-definition.ts) · [section-definition.ts](src/models/section-definition.ts) · [field-definition.ts](src/models/field-definition.ts) | The four definition types. Each registers itself with its parent in its constructor. `FieldDefinition` also carries `label` and `isDeprecated`. |
| [src/models/definition-factory.ts](src/models/definition-factory.ts) | `DefinitionFactory.form/page/section` and `defineFields(section, specs)`. `defineFields` derives the wire name by camel→kebab unless `name` overrides it. `section` takes an optional `ISectionDefinitionOptions` — today just `isShared`. |
| [src/models/schema.ts](src/models/schema.ts) | `Schema` base — an empty constructor; a schema is found through the definition tree it builds, not by registering itself. |
| [src/models/entity.ts](src/models/entity.ts) | `Entity` base and the definition registry. |
| [src/models/actor.ts](src/models/actor.ts) | `IActor`: who did something to a report, as the host identifies them -- an `id` and a `name`, and optionally a `badgeId`, a `rank` and an `agency`. It is a **snapshot**, copied onto what the user does rather than looked up later, so a change of rank afterwards does not rewrite a report. Roles are deliberately not part of it. Audit records, review comments and workflow history carry one. |
| [src/models/form.ts](src/models/form.ts) | `FormModel`. `initialize()`, `addPage`/`removePage`, `getFirstField`, `getFields`, `getPages`, `getPagesFor`, `setMode`, `setStatus`, `validate`, and the workflow data/primitives: `workflow`, `history`, `lockSection`, `lockPageSet`, `isSectionLocked`, `isPageSetLocked`. `variants` (`IFormVariant`, [form-variant.ts](src/models/form-variant.ts)) are the blank forms a form that comes in more than one shape can start as, empty by default. A form with variants flags **exactly one** `isDefault` -- what it starts as, what a record naming no variant opens as, and what a preset naming none is for -- and `getDefaultVariant()` throws otherwise (undefined for a form with none). `getVariant()` is the id of the variant the form is in (undefined by default); `applyVariant(id)` reshapes it and throws by default. `FormStatus` is a plain closed union; `knownStatuses` is its runtime witness, exported for `@forms/workflow` to validate a loaded status against. Interpreting `workflow` (`getTransitions`/`canTransition`/`transition`/`restoreWorkflow`) is [`@forms/workflow`](../workflow/CLAUDE.md) now, not a method here. |
| [src/models/workflow.ts](src/models/workflow.ts) | `IWorkflow`, `defineWorkflow`, and the types around them: `IWorkflowTransition`, `ITransitionOptions`, `IWorkflowEntry` (one line of history), `IWorkflowStamp` (a record's history), `WorkflowGuard`, `WorkflowStep`. See Workflow below. |
| [src/models/page.ts](src/models/page.ts) · [page-collection.ts](src/models/page-collection.ts) · [section.ts](src/models/section.ts) | `PageModel` (also holds dropzones), the immutable `PageCollection`, `SectionModel`. |
| [src/models/field.ts](src/models/field.ts) + [boolean-](src/models/boolean-field.ts)/[number-](src/models/number-field.ts)/[string-](src/models/string-field.ts)/[option-field.ts](src/models/option-field.ts) | `FieldModel` and its four concrete types. |
| [src/models/citation-form.ts](src/models/citation-form.ts) · [crash-form.ts](src/models/crash-form.ts) | Abstract `FormModel` subclasses for the two form families. Every `set*` on both returns `this` — a form stamping a value on itself must thread the change back through the page collection, or the immutable setter's result is discarded. `CitationForm.initialize()` chains `setDateOfViolation().setTicketNumber()`; `CrashForm` leaves the chaining to the concrete form. Each also carries its family's `workflow` (`citationWorkflow`, `crashWorkflow`), which a concrete form overrides with `with`. |
| [src/models/validation/](src/models/validation/) | Rules, conditions, contexts, collections, `RulesController`. See below. |
| [src/models/import/](src/models/import/) | Drag-and-drop import: `Dropzone`, `PersonDropzone`, `VehicleDropzone`, `ViolationDropzone`, `IDraggableItem`, and the zod-validated `IImportablePerson`/`IImportableVehicle`/`IImportableViolation`. A form registers a `ViolationDropzone` with only the fields it actually prints; a dropzone ignores a key it holds no field for. |
| [src/controllers/](src/controllers/) | The `Controller` base class, `@RegisterController` and its registry, `ControllerManager`, and the four controllers. See below. |
| [src/hooks/use-form.ts](src/hooks/use-form.ts) · [use-print-state.ts](src/hooks/use-print-state.ts) · [use-active-page-id.ts](src/hooks/use-active-page-id.ts) | `useForm(controller)` (via `useSyncExternalStore`), `useFormController(manager, form)` (which also holds the manager while mounted), `usePrintState(controller)`, and `useActivePageId(controller)`. |
| [src/mapping/](src/mapping/) | `FormMapper` base, `IPopulateData` (`data`, `readOnlyFields?`, `status?`, `workflow?`)/`ReadOnlyFields`, and the common `ICrash` / `IReportData` contracts. `read` and `write` mirror each other — target first, key named once — so every field a mapper writes is lockable by threading `populate`'s optional `readOnlyFields` through its section methods. |
| [src/components/](src/components/) | The `F*` components. See below. |
| [src/utils/](src/utils/) | `withChanges`, `buildClasses`, `useDisposables`, `IFilterable`, `Mutable`, `setOptionWithDependents`. |
| [theme/](theme/) | SCSS. `theme/_main.scss` is the entry a host imports. |
| [test/](test/) | Vitest suites, mirroring `src/`. [test/fixtures/](test/fixtures/) holds the in-memory form and the rule-context stub. Outside `tsconfig.json`'s `include`, so `tsc -b` never sees it. |

## Field models

| Model | Value type | Default | `getIsEmpty()` |
| --- | --- | --- | --- |
| `StringFieldModel` | `string \| string[]` | `""` | base: null/undefined/`""`/`false` |
| `NumberFieldModel` | `number \| number[]` | `0` | overridden: `0` counts as empty |
| `BooleanFieldModel` | `boolean \| boolean[]` | `false` | base — so a checkbox is **never** empty when true, and `false` reads as empty |
| `OptionFieldModel` | `IOptionValue` (`{value, description}`) | `{"",""}` | overridden: empty when both halves are blank |

Every field also carries `hasError`, `isEnabled`, and a uuid `id` used as the DOM id.

## Controllers — where mutable state lives

`ControllerManager` is created by the React layer (`ReportViewerForm`), one per form. It caches controllers by key
and re-broadcasts each one's `onChanged` through `onControllerChanged`. It also holds **who is using the report** as
`user` (an `IActor`, set with `setUser`), which the controllers that attribute what happens -- `@forms/audit` and
`@forms/review` -- read when they act rather than keeping a copy. Set it before `loadForm`, so that what the load
itself records, such as the audit's opening record, carries it. It holds **how the form arrived** the same way, as
`arrival` (a `FormArrival`, set with `setArrival`): read from a record the host held, or started without one -- from the
template and as the variant the user picked, if they did. The audit reads it as it opens the form to say which, so it too is set before the
form is loaded; it names the form it is about, and is ignored for any other.

Every controller extends the abstract `Controller` and is declared with `@RegisterController(key, { eager? })`, which
puts a **descriptor** — the key and the class — in the static `ControllerRegistry` when the class's module loads. The
registry holds no controllers: each manager constructs its own, lazily, the first time a key is asked for
(`getController(key)` or one of the typed `getXController()` accessors), always as `new ctor(manager)` followed by
`start()`. A controller that needs another asks the manager for it, and does so in `start()` rather than the
constructor, since the manager cannot yet be asked for anything mid-construction. `eager: true` creates it when a form
is loaded instead, for a controller that observes the others and would otherwise miss what happened before it was
first asked for. A different class registering a key that is taken throws; the same class name replacing itself is
allowed, because that is what a hot reload does.

Registration is an import side effect, so a controller only exists for managers created after something has imported
its module. The manager imports the ones in this package for exactly that reason. `Controller` gives each one its
`key` (from the decorator, on the class itself — a subclass that skips the decorator throws rather than sharing its
parent's), `onChanged`, a protected `emitChanged()`, and no-op `start()`/`dispose()` to override.

Something that happened can be **reported** to whatever observes the manager, in two ways, and the manager relays both
as its one `onActivity` (which survives the form controller being replaced):

- **A controller reports it itself** with the protected `emitActivity({ kind, ... })`, which raises its `onActivity`;
  the manager relays it as `{ activity }`. The kinds are declared by whoever reports them, by merging into
  `IControllerActivityMap` (`declare module "@forms/core" { interface IControllerActivityMap { "kind": { ... } } }`).
- **An update names what it was**, with `reason` on `update()` (and on a binding's `update`), a kind from
  `IFormActivityMap`. The form controller relays it as `{ activity, form }`, with the form the update produced -- only
  when the form actually changed and a `reason` was given. Core declares `dropped`, and `page-added` / `page-removed`,
  which `addPage` and `removePage` pass themselves (`{ page, pageOrdinal }`, counting from zero); a package above it
  merges in its own (`@forms/violations` declares `violations-added`).

Core also declares `page-focused` in `IControllerActivityMap`, which `NavigationController` reports itself. Nothing in
core reads an activity. `@forms/audit` records each one as it comes.

- **`FormController`** owns the current `FormModel` and is the single path for every edit. It is constructed empty
  like every other controller; `loadForm` seeds it through `load(form)` (which raises nothing and is a no-op once a
  form is held), and `form` throws until then. `update(fn)` computes a new form and, if the identity changed, emits
  synchronously — deliberately **not** deferred through `startTransition`, since subscribers read `controller.form`
  directly.
  - `getPageBinding(pageDefinition, pageId)` → `IPageBinding`; `binding.getSection(sectionDefinition)` →
    `ISectionBinding`. Bindings are cached and address a page by **id**, so they survive other pages being
    added or removed.
  - **Always compute from the argument** the update callback hands you, never from a section/page captured during
    render — a captured one may already be stale.
  - `addPage`/`removePage` (removal goes through the `ConfirmPageDelete` policy set by `ReportViewerForm`).
    `addPage` copies the page definition's **shared** sections from the first page onto the new one, field by
    field — not by carrying the section across, since every field's uuid is the DOM id of the input rendered for
    it and pages print together.
- **`DragAndDropController`** relays `onDragStart`/`onDragEnd` between `FDraggableItem` and `FDropzone`, and holds the host's `ConfirmDropReplace` policy (`setConfirmReplace`), asked by `confirmReplace` before a drop replaces a record; with none set, a drop replaces without asking. `ReportViewerForm` sets it to a confirm modal, as it does `setConfirmDeletePage`.
- **`PrintController`** holds the `IPrintState` (`layout`, `pageNames`, `scale`) of a print in progress, or
  `undefined` when there is none. `FPageCollection` reads it through `usePrintState` and swaps its tab strip for the
  pages the print is for. It carries no notion of *what* is being printed or why — `@forms/printing` decides that
  and `begin`s the state; core only renders it. `state` is stored by reference and replaced only in `begin`/`end`,
  since it is a `useSyncExternalStore` snapshot.
- **`NavigationController`** carries a one-shot `goTo({ pageId, fieldId })` to the page collection, which shows the
  page and focuses the field, and remembers which page is showing. `FPageCollection` reports that with `setActivePage`
  after each commit -- `undefined` while a print is in progress -- and anything that marks controls in the document
  (`@forms/review`'s comment markers) reads it through `useActivePageId`, because `FPane` renders an empty `<div>` for
  a tab that is not active, so only the active page's controls exist to be found. The controls are found by the
  `data-field-id` attribute `FFieldControl` and `FFieldCheckbox` carry on their root, through `getFieldControl`.
  `setActivePage` also takes an optional `{ page, pageOrdinal }` saying what the page is (the page collection knows the
  definition's name and where the page sits), and reports a **`page-focused`** activity when a page other than the
  last one shown comes into view, in any mode. The first page shown is silent, since the form's opening record says it, and so is
  the same page coming back after a print, which sets `undefined` in between. So is the first page of a different form
  loaded into the same manager ("Start new form"): the page collection passes the form's id as `formId`, and a page
  shown for a form other than the last one's counts as the first.
- **`RulesController`** (in `models/validation/`) runs the rule collection and holds the resulting
  `RuleIssueCollection`. It reads `form` through the manager each time it is needed, so it can never be validating a
  stale model; its rules are the form's own unless `getRulesController(ruleCollection)` sets one or
  `addRuleCollection` adds to it.

`loadForm(form)` compares by `form.id` — seeding the same form again is a no-op; a genuinely different
form disposes the form and rules controllers. It also creates every eager controller, after the form controller, and
those survive a form swap. When the form is new to the manager it raises `onControllerChanged` for the form
controller, since seeding raises nothing itself and that is how an observer (`@forms/audit`) learns of a swap. `dispose()` releases controllers last created first, so one that observes another goes
before what it observes.

**A form remembers the fields the host closed.** `FormModel.populate` keeps the `readOnlyFields` it was given on the form it
returns (`FormModel.readOnlyFields`), merged with those it already held (`mergeReadOnlyFields`: a field either marks
stays marked, and a list of pages is laid over by position), as the form keeps its locked sections. It is how a change
made later -- a preset applied to the report -- can tell which fields were settled by the host. It is only what the host
declared: a form's own stamps, a workflow's locked sections and a field its own rules disable are not in it. Note that
`ReadOnlyFields` types an optional list (`persons?: ReadonlyArray<...>`) as a plain `boolean`, since `undefined` is
among its values; a mark by page needs a contract whose list is not optional.

**`isRecord`** (`utils/is-record.ts`, exported) is the one answer to whether a value is a record to walk key by key: an
object that is not an array, and **not an option box's `{ value, description }` pair**, which is one field and not two.
`@forms/audit`'s paths and `@forms/report-viewer`'s presets both walk a report by it.

**`useFormController` seeds a form once, not on every render.** A form swapped in since ("Start new form", through
`setForm`) has a different id, so seeding the one the hook was handed again on the next render -- any render of the
host, such as a route that re-renders as its url changes -- would dispose the controllers and bring the first form
back, and the new one would flicker and vanish. The hook seeds only when it is handed a form or a manager it has not
seeded before.

**The manager also knows when it is let go.** `retain()` and `release()` count what is showing it, and
`useFormController` retains it while mounted, closes it on `pagehide`, and reopens it on a `pageshow` that says the
browser restored the page from its cache (`persisted`). A release closes it a microtask later unless something retains
it again by then, because React's development remount (`StrictMode`) lets go and holds again at once, which is not the
viewer going. `close()` closes it now and is idempotent; `onClosed` fires once when it does, and `reopen()` on a closed
manager raises `onOpened`. **Closing detaches nothing**, since a page that is put away may come back; what is attached
is let go only when a release settles. `attach(key, setup)` runs `setup` once for the key and runs its teardown then --
after `onClosed`, last attached first, so what is said as it closes still reaches whatever it was attached for.
Attaching a key it already holds does nothing, which is what makes a remount safe; `useAuditRecorder` and
`useAuditWriter` are attached this way. Nothing re-attaches after that unless the effect that attached it runs again.
In a test, `StrictMode` only sets effects up twice when it is the **outermost** element rendered into the root;
anything above it turns that off.

## Shared sections

A section declared `DefinitionFactory.section(name, page, Ctor, { isShared: true })` holds the same values on
**every instance of its page**. It exists because a citation page repeats once per violation and only the charge
is meant to differ: the violator, vehicle and officer boxes read the same on all of them.

One flag, three consumers, and **no change to any component**:

- `PageBinding.getSection` hands back a `SharedSectionBinding` for a shared definition, whose `update` runs against
  every page's own copy of the section. A section component keeps calling `binding.setValue(...)` and the write
  fans out, because the flag is on the definition rather than in the call.
- `FormController.addPage` seeds a new page's shared sections from the first page.
- `RulesController` evaluates a rule reading only shared sections once, not once per page.

**The update is run per page rather than one result being written into all of them.** Every `FieldModel` carries a
uuid used as its DOM id, so a section shared by reference would repeat those ids across pages — which collides for
real under `FPageCollection`'s print branch, where the pages render together rather than as tab panes. Running the
update per page converges the values while leaving each page its own field identities, which works because a field
is set to an absolute value rather than by a delta.

A mapper does **not** get this for free: a page it creates goes through `pageDefinition.createPage` rather than the
form controller, so `populate` has to write the shared sections onto every page itself.

## Workflow -- the model half; [`@forms/workflow`](../workflow/CLAUDE.md) is the other half

This package owns only the **data** and the generic primitives a workflow's `locks` call into; **interpreting** a
workflow -- which transitions a form can make now, and what making one changes -- is `@forms/workflow`'s
`WorkflowService`, one level above core. `FormModel` used to do both (`getTransitions`, `transition`,
`restoreWorkflow`, a private `applyLocks`), but that bloated the model with logic that only ever mattered to a form
that had a workflow, so it moved out. Nothing here calls into `@forms/workflow` -- core has no dependency the other
way -- the service is simply handed a form and reads its `workflow` off it.

A form declares the rules its reports move by as an `IWorkflow` on the form model: `transitions` keyed by id, and
`locks` keyed by status. It works off the closed `FormStatus` union -- a workflow does not invent statuses -- and
`citationWorkflow`/`crashWorkflow`/`warningWorkflow` are presets a concrete form assigns to its own `workflow`
directly (**not** inherited from `CitationForm`/`CrashForm`/`WarningForm` -- see `packages/forms/CLAUDE.md`'s
"Conventions that hold everywhere"), as-is or overridden with `preset.with({ id, locks, transitions })`: the same as
the preset except for what it is given, a lock or a transition replacing the preset's under the same key.
`defineWorkflow` freezes what it makes, since one workflow can be shared by more than one form, and refuses a
transition made from no status.

A transition names the statuses it is made `from`, the `mode` the form must be in (the capacity the user acts in --
roles are deliberately not modelled, so the host still picks the mode), the `to` status, the bootstrap `icon` its
button shows (required -- its button carries no text, so a transition has to pick one), an optional `effect` run on
the form as it moves, and optional `guards` (today two, opposites of each other: `"hasOpenComments"` and
`"noOpenComments"`). `WorkflowService.getTransitions(form)` lists what can be made now, and
`WorkflowService.transition(form, id, by, { issues, note?, openComments?, at? })` makes one, returning the new form.
It **throws** unless the transition exists, the form is in a `from` status and the right mode, **the validation
result holds no error** (warnings do not count, and there is no exception for Reject), and whatever guard the
transition names holds -- `hasOpenComments` needs at least one comment open (Reject), `noOpenComments` needs none
(resubmitting a rejected crash report, or approving one, so every comment must be resolved first). The service is *told* the
validation result and the open-comment count rather than finding them itself -- it cannot see the rules controller
or the review controller -- so a caller has to validate first. Each transition appends `{ transition, from, to, at,
by, note? }` to `form.history`, and `FormModel.extractData` stamps `{ id, version, history }` into the record as
`workflow` -- that stamping stays here, since it only reads `form.history`/`form.workflow`, both plain data.

A `lock` is a function `(form) => form` run when a form takes the status **and again when a record in that status is
loaded**. Loading is `WorkflowService.restoreWorkflow(form, status, stamp)` now, called as an explicit step after
`populate` -- `populate` itself no longer restores `status`/`workflow` or applies any lock, since that is
interpretation, not mapping. Three primitives close things without a mode change, and stay here since they are
generic form capabilities a lock function calls into rather than workflow-specific themselves:

- `lockSection(definition)` disables the section's fields on every page, and on any page added later.
- `lockPageSet(definition)` closes the structure only: `addPage` and `removePage` throw, and the fields are untouched.
- `setMode("viewable")` closes the whole form, and is what the family presets use.

`isSectionLocked` / `isPageSetLocked` are what a component asks (`IPageBinding.isSectionLocked` for a page's own
section), and `FPageCollection` hides add and delete for a locked page set. A record loaded under a different workflow
id keeps its history rather than dropping what it cannot read.

## Validation

`Rule` (abstract) → `FieldRule` (bound to one `FieldDefinition`) → the concrete rules. `Rule.when(condition)`
returns a copy gated by a `Condition`.

| Rule | Notes |
| --- | --- |
| `RequiredFieldRule` | Fires on an empty value. |
| `MaxLengthFieldRule` | Takes min **and** max; message interpolates `{maxLength}`. Skips empty values. Measures a non-string value (e.g. a number) by its printed length. |
| `NumberRangeFieldRule`, `DateRangeFieldRule` | Skip empty and unparseable values. `DateRangeFieldRule` statics: `notInFuture`, `inFuture` (after today; today itself is refused), `notBefore`. Parses `YYYY-MM-DD` and `MM/DD/YYYY`, which cannot be mistaken for each other. |
| `PatternFieldRule` | Strips a global flag (`lastIndex` would leak between pages). Registers under `new.target.name`, so subclasses get their own name. |
| `AlphanumericFieldRule` | A `PatternFieldRule` subclass. |
| `RequiredSelectionRule` | At least one of a checkbox group, or `atLeast(n, …)` of it; reports **once**, against the anchor field. |
| `CompositeRule` | `LogicalOperator.and` reports every issue; `or` reports nothing if any rule passes. Statics `and`/`or`. Its rules need not share a field. |

Conditions: `FieldValueCondition` (`equals`/`notEquals`/`isEmpty`/`isNotEmpty`; unwraps `IOptionValue` before
comparing) and `CompositeCondition` (`all`/`any`).

`RulesController.validate()` evaluates each rule **once per page instance** of `rule.getPageDefinition()`, building
a `RuleContext(form, page)` — except a rule that answers `isShared()`, which is evaluated against the first page
alone. `FieldRule.isShared()` reads its field's section; `CompositeRule` and `RequiredSelectionRule` answer true
only when every field they read is shared. Without it a required violator name would be reported once per page on
a citation carrying three violations, all of them the same issue. That is what keeps a multi-field rule comparing fields from the *same* copy of a
repeatable page. `RuleContext.getField` resolves within the bound page, falling back to the first instance on the
form when the field belongs to another page definition. `FormModel.getPagesFor` returns `[]` (rather than throwing)
for a page the form has no instances of, so such a rule is skipped.

## Tests

`yarn test` (watch: `yarn test-watch`, typecheck: `yarn test-types`). The config is one line on top of the shared
[vitest.config.base.mts](../vitest.config.base.mts), overriding its `jsdom` default to `environment: "node"` — the
model, controller, mapping and validation surface has no react or DOM dependency, and keeping the environment out
of the way is what makes an accidental import of a component fail loudly rather than quietly succeed against a
shim. That is also why this package's tests import deep source paths rather than `@forms/core`.

Tests live in [test/](test/), mirroring `src/`, **not** beside the source: `tsconfig.json` sets `include: ["src"]`
and `rootDir: "src"`, so a colocated `*.test.ts` would be compiled into `dist/`. [test/tsconfig.json](test/tsconfig.json)
is what typechecks them and what oxc reads compiler options from — Vitest itself strips types without checking them.
Every component has a test in [test/components/](test/components/), one file per component (a family such as
`FGrid` or `FOffCanvas` shares one). Hooks are tested in [test/hooks/](test/hooks/), and `useDisposables` in
[test/utils/](test/utils/), through `renderHook` in [test/fixtures/render-hook.ts](test/fixtures/render-hook.ts): it calls
the hook from inside a small component, since no testing library is installed, and gives back the last result, a count
of renders, `rerender` and `unmount`. A hook that subscribes to a controller is checked for the same things each time:
that it answers what the controller holds, follows a change, does **not** render again for an update that changed
nothing (the snapshot is the stored state itself, so a fresh object would loop), stops listening on unmount, and
listens to the controller it is handed *now* when given another.

Components are tested one of two ways. A purely presentational one is rendered with `renderToStaticMarkup`, which needs
no DOM, so it stays in the `node` environment. One that has behaviour -- a click, a drag, a focus, an effect -- opts
into `jsdom` for its file with a `// @vitest-environment jsdom` docblock and is driven with `createRoot` and `act`. The
files are `.ts`, so elements are built with `createElement`. Three things jsdom lacks are stood in for by hand: drag
events get a `dataTransfer` defined on a plain `Event`; layout (`clientWidth` and the like, for `FWatermark`) is
defined on `HTMLElement.prototype` for the length of a test; and `AnimationEvent` is defined before react-dom loads,
or it takes jsdom for an old browser and listens for the webkit-prefixed animation event. `FFieldSelect` mocks
`@popperjs/core`, since popper measures layout. `FPageCollection` is driven over a real form and controllers from
[test/fixtures/citation-form.ts](test/fixtures/citation-form.ts) rather than stubs. Workflow behaviour is driven over
[test/fixtures/workflow-form.ts](test/fixtures/workflow-form.ts) (a header and a charge section on one repeating page, with a
workflow that runs an effect, needs an open comment and locks the charge) and the family presets over
[test/fixtures/preset-forms.ts](test/fixtures/preset-forms.ts) (concrete citation and crash forms with no pages).

| Rule | Why |
| --- | --- |
| Import deep source paths, never `src/index.ts` or `src/utils/index.ts` | The barrel re-exports `src/utils`, which pulls in `disposable.ts` and with it a value import of react |
| Build a fixture's definition tree once, at module scope | `Entity.set` validates by reference identity, so a tree rebuilt per test throws for any entity still holding the old definitions |
| Give each fixture its own model subclasses | `Entity.definitionRegistry` is keyed by model constructor, so a constructor backs exactly one definition |
| Give each fixture controller its own key | `ControllerRegistry` is static and throws when a different class claims a key that is taken |
| Build a controller through a `ControllerManager`, never `new` | A controller's constructor takes the manager and finds its key from the decorator; `manager.loadForm(form)` is how a `FormController` gets its form |
| Seed field values with `setValue`, never a field model's constructor | A concrete field's `value` class-field initializer runs after the base constructor and overwrites it — see Gotchas |
| Never call `FormModel.dispose()` in a hook | It clears both registries process-wide. Vitest's per-file isolation already gives each file a fresh tree, which is why `isolate` is left on and the pool is `vmThreads` (a context per file) rather than `isolate: false` |
| `await` a form's `initialize()` | It is what creates the pages; a form that has only been constructed holds empty page collections |
| A rule needs no form | `IRuleContext` is `{form, page, getField}` and nothing reads `form` or `page`, so `stubRuleContext(field)` is a complete stand-in. Only `RulesController.validate` needs a real `RuleContext` |

## Components

Presentational and mostly prop-driven; they do not reach for the form themselves.

- Structure: `FForm`, `FPageCollection`, `FPage`, `FSection`, `FFormStackPanel`, `FBorder`, `FAccordion`,
  `FWatermark` (+ `getStatusWatermark`), `FNavTab` (tabs and panes; a pane's `content` is a component, lazy or not,
  and `onSelect` reports each tab selected -- `FPageCollection` composes its `Tab` and `Pane` parts directly),
  `FFormHeader` (title, optional subtitle, optional `borderVisibility`, and `children` as an actions slot -- no
  knowledge of what fills it).
- `FWorkflowActions` renders an icon button (its `transition.icon`, no text) for each `IAvailableTransition` it is
  given (`transitions`, `openComments`, `user`), always tooltipped -- with its title while enabled, with a blocker
  it computes itself while not -- and reports a click as `onSelect(transition, user)`. Purely presentational, like
  everything else here -- `@forms/report-viewer`'s `WorkflowActions` (not this one) owns validating and confirming,
  and its `IReportViewerService.transition` the saving and applying, since none of that is reachable from core.
- Fields: `FFieldControl` (label + border chrome), `FFieldInput`, `FFieldSelect`, `FFieldCheckbox`,
  `FFieldTextArea` (a multi-line input that takes `label` for assistive technology and `margin`), `FLabel`,
  `FInputGroup`.
- `src/components/fields/` holds `FTextField`, `FNumberField`, `FSelectField` and `FCheckboxField` (a tick box with
  its label beside it, taking an optional `label` override rather than `showLabel`, and `type="radio"` for one of a set)
  -- one file each -- the compound
  boxes bound directly to a field model (`field.label`/`getIsEnabled()`/`getHasError()`/`getValue()`/`id` read
  straight off it, `FFieldControl` and the raw control wired together underneath) rather than a caller wiring
  `FFieldControl` and `FFieldInput`/`FFieldSelect` by hand. Each takes `showLabel` (default true) so a caller can
  suppress the label for a row inside a table that prints its column labels once, in a header row above it, instead
  of on every row. `FTextField` and `FSelectField` also take `border` (for a borderless box) and `inputPadding`, and
  `FTextField` `inputMargin`, which style the control inside the box rather than the box itself. Both take
  `disabled`, which closes the box on top of the field's own enabled state; `FSelectField` takes
  `placeholder`, `showPlaceholderWhenDisabled` and `searchable` (true by default). Every form package used to hand-roll this pairing, or keep a near-duplicate `TextBox`/`NumberBox`/
  `SelectBox` trio in its own `fields.tsx` -- these three are that pairing, generalized. A form-specific name or
  default (TR-310's `CodeBox`, pinned to a 44px width and `valueOnly` format; ok-traffic's `YesNoBox`, pinned to its
  Y/N list) stays local as a thin wrapper over `FSelectField` rather than moving here.
- Review: `FComment` (author, time, text, and its children as its actions) and `FCommentMarker` (a button in a
  control's corner: a count, or an invitation to add the first comment). Presentational only -- `@forms/review` owns
  what they show. A marker sits in the corner of a control, so the control has to be positioned; `_comment.scss`
  does that for any `[data-field-id]` holding one. An empty marker is hidden until its control is hovered or focused,
  but stays a real button, since a disabled input swallows the pointer and a reviewer on a locked form still has to
  reach it by keyboard.
- Lists/chrome: `FListGroup`, `FListGroupItem` (with `onClick` and no `href`, a `role="button"` row reached by Tab and pressed with Enter or Space; not while disabled), `FListGroupCheckbox`, `FListGroupHeading` (a row titling the items
  beneath it, which cannot be acted on), `FBadge`, `FButton`, `FCode`, `FIcon`, `FModal`,
  `FOffCanvas`, `FNotification`, `FLoadingIndicator`, `FAsyncLoader`. `FCode` is a `<pre><code>` panel whose
  colors are bootstrap's theme-aware custom properties, so it follows the day/night toggle. `FBadge` is a bootstrap
  badge with a prop for each concern -- `variant`, `pill`, `overlay` (on the corner of the `FButton` it is in, which
  the theme positions) and a `label` read by assistive technology.
- Import: `FDraggableItem`, `FDropzone`. `FDraggableItem` takes `disabled` for an item a panel is offering but
  cannot currently be dragged — it clears `draggable` and refuses `dragStart`, which is what stops a panel's
  locked row reaching the form by the one route a disabled checkbox does not cover. `FDropzone` takes the page's
  `binding` and gates itself: closed when the form isn't editable, the zone's section is locked, or it has no `onDrop`,
  so no page writes its own gate. **A drop replaces the whole record** its zone maps (NCIC: a field the item lacks is
  cleared, never kept), so when the zone already holds one -- `Dropzone.getIsOccupied(page)`, any mapped field answered
  on the page as it stands, read through `getCurrentFields(page)` since the dropzone's own `fields` are the snapshot
  taken when the page was built -- it asks `confirmReplace` first, naming both records with `describe` (person: first
  and last name; vehicle: year make model; violation: description, else statute). It asks before `onDrop`, which may be
  async, so a refused replacement never starts a vehicle lookup. Host field locks (`readOnlyFields`) are not checked:
  no drop target is host-locked today.

`FNotification` closes itself after `duration` milliseconds, counting down in a bar along its bottom edge. **The bar
is the timer**: the notification calls `onClose` on the bar's `animationend`, so pausing the animation (on hover, on
focus within, or while the tab is hidden) pauses both, with no timer to keep in step. `count` shows a `×N` badge once
above one, and doubles as the bar's `key`, so raising the same notification again restarts the countdown. Dismissal
depends on animations running: if something suppresses them the notification simply stays until closed, and the
animation must not be disabled under `prefers-reduced-motion`, or nothing would ever close it. An omitted or `0`
`duration` shows no bar and never closes on its own.

`FPage` pins `data-bs-theme="light"` on itself. A page is a printed document — white paper with a dark border in
either color mode — so when the host flips the document to dark, the attribute stops at the page and every field
rendered on it stays legible. Anything painting page chrome should keep that in mind rather than reaching for a
theme-aware color.

**`FPage` also auto-fits itself to whatever width it's given**, since every state form's page is a fixed pixel width
(`.f-crash.f-page { width: 1024px !important; }` etc. in `theme/components/_page.scss`) built to match the printed
form, and that alone is most of a small screen — a toughbook, say. `usePageScale` (`src/hooks/use-page-scale.ts`)
measures the page against its own parent element on every resize (`ResizeObserver`) and answers a factor applied as
`--f-page-scale`, consumed by `zoom: var(--f-page-scale, 1);` on `.f-page` itself. `zoom`, not `transform: scale`, is
deliberate: it changes the *used values* of the whole subtree, so the shrunk page's layout box, click regions, and
every field's real size all agree — nothing needs separate coordinate compensation the way a transform would.
Scaling is one-way (`Math.min(..., 1)`): a page already narrower than its container is never blown up. It bottoms
out at `minScale` (0.7) rather than shrinking indefinitely, past which the container scrolls horizontally instead —
below that, individual fields start becoming uncomfortably small to read or tap. Because the natural width differs
by form type, `usePageScale` recovers it by dividing the page's own current measurement by whatever scale it last
applied, rather than trusting a hardcoded constant — this also means repeated resizes converge instead of
compounding, since each measurement backs out its own previous effect first.

This runs **only** on screen. `.f-print .f-page` (`theme/components/_print.scss`) forces `zoom: 1`, so a page's
on-screen auto-fit scale never compounds with `--f-print-scale` — print already measures and scales the whole
`.f-print` block itself (see `@forms/printing`'s `PrintService.getScale`, the pattern `usePageScale` mirrors for the
screen case).

`FOffCanvas` takes a `placement` of `"start"` (the default, where the validation panel sits) or `"end"`. Two panels
that can be open at once need different edges, or they cover each other. It is plain markup with no backdrop and
no portal, so it has to be rendered somewhere that is not itself a stacking context — which is why
`@forms/report-viewer` mounts every panel at its own root rather than inside its `position-fixed` options bar.

A panel is `FOffCanvas.Header`, `FOffCanvas.Body` and, for one that has actions, `FOffCanvas.Footer`. The body is the
part that scrolls (Bootstrap makes the off canvas a flex column and the body the growing one), so the footer that
follows it stays pinned at the bottom with the actions in reach however long the list is. It has a prop for each
concern rather than utility classes for a caller to spell: `borderVisibility` (a border above it, like the header's
below it), `direction` (`"horizontal"` by default, or `"vertical"`), `contentAlignment` and `contentJustify` (the same
values `FBorder` takes, and applied only when given), and `padding` (pixels, sixteen on every side unless told
otherwise, with per-side overrides that leave the other sides at sixteen).

`FPageCollection` takes `controllers` (the manager, **not** a form controller — it resolves the form and print
controllers from it) and `groups` of `{pageDefinition, children(binding)}`, and renders them as **one continuous tab
strip numbered across all groups combined**. It derives the watermark from `form.status`, stamping it only while
`form.mode === "viewable"`, and wires the page add/delete buttons to the form controller, both only while
`form.mode === "editable"`. `FormMode` has three values: `"editable"`, `"viewable"` (a locked snapshot, styled like a
printed record) and `"reviewable"` (viewable that a reviewer can also comment on while it is in review, and so without the watermark, since
it is being worked on). Everything else that locks a form -- `setMode`, add/delete, `FDropzone`'s own gate -- asks whether the mode is *not* `"editable"`, so a new locked mode needs no change to any
of them; the watermark is the exception, and a new locked mode gets none until it is added there.

While the print controller holds a state, it renders a second way instead: the pages the print is for, flat, inside
`<div class="f-print f-print--{layout}">`, with the add and delete affordances omitted — neither belongs on paper.
Pages are selected by page definition **name** and ordered by the print state's `pageNames`, so a printable copy can
be declared as plain strings by a form module and a name matching a repeating page type contributes every instance
of it.

**`FPageCollection` itself knows nothing about printing being "like" viewable mode — it doesn't have to, because
`@forms/printing` switches the form to `"viewable"` for the duration of the print.** See
[`@forms/printing`](../printing/CLAUDE.md)'s `PrintService.print`. By the time the print branch renders, `form.mode`
already reads `"viewable"`, so the watermark, the disabled fields, and everything downstream that keys off `mode` or
`disabled` behave exactly as they would if the record had been opened read-only in the first place — nothing here
is print-specific.

`IPageBinding.mode` mirrors the owning form's `FormModel.mode`, so a page component that only has a binding (never
the form itself) can still gate a dropzone's `onDrop` on it without the mode being threaded down as a separate prop.

`FFieldSelect` takes `options` as an array **or** a loader `(parentValue?) => Promise<IOptionValue[]>`, plus
`parentValue`. A dependent select is expressed entirely by passing the parent's code as `parentValue` — no field
carries knowledge of another field. Its placeholder (and `FFieldInput`'s), and its toggle's dropdown chevron, are
hidden while `disabled`, since a locked field inviting a click or a keystroke it can't act on is confusing whether
that lock came from the whole form being viewable or from print. `showPlaceholderWhenDisabled` opts a select back in
for the one legitimate case where `disabled` means something else: a select disabled because another field's value
is missing, not because the form is read-only. A date `FFieldInput` with nothing typed into it renders as plain text
rather than `type="date"` while disabled, since an empty native date input shows its own "mm/dd/yyyy" regardless of
`placeholder` -- that hint is the browser's own control chrome, not styleable text, so it can't be hidden any other
way; a date carrying a value keeps rendering as `type="date"` so it still shows through the browser's own display.

## Recipes

**Add a field type**: new `FieldModel` subclass in `src/models/`, export it from `index.ts`. Override `getIsEmpty`
if the type's default should read as empty.

**Add a controller**: a class extending `Controller` in `src/controllers/`, decorated `@RegisterController(key)` (add
`{ eager: true }` if it observes the others). Give it a key in `ControllerKey` if this package owns it, and an
interface extending `IController` beside it. Do no work in the constructor; read other controllers through
`this.manager` in `start()`, and call `this.emitChanged()` when its state changes. Add a side-effect import for its
module to `controller-manager.ts` and a typed `getXController()` accessor if callers will want one. A controller from
another package needs none of that: it imports `Controller` and `RegisterController` from `@forms/core`, picks its own
key, and offers a typed accessor wrapping `manager.getController<T>(key)`.

**Add a validation rule**: subclass `FieldRule` (single field) or `Rule` (anything else) in
`src/models/validation/rules/`, decorate with `@RegisterRule(YourRule.name)`, give it a
`static readonly defaultMessage`, export the class and its interface from `index.ts`.

**Add a component**: `src/components/<name>/<name>.tsx` + `index.ts`, export from `src/index.ts`, add
`theme/components/_<name>.scss` and reference it from `theme/_main.scss` if it needs styles.

**Clear a dependent select when its parent changes**: use `setOptionWithDependents(binding, parentField,
[dependentFields])` — it moves both in a single update.

**Add a test**: `test/<mirror of the source path>.test.ts`, importing the source by deep relative path. Reach for
[test/fixtures/citation-form.ts](test/fixtures/citation-form.ts) only when the assertion genuinely needs a built
form — a rule or a collection does not. `test/tsconfig.json` inherits `isolatedModules` (a type-only import must
be written `import type`) and `noUnusedLocals` (an unused import is a hard error), so run `yarn test-types` as well
as `yarn test`.

## Gotchas

- `Entity.get` **throws** for a missing/falsy value; `PageModel.getDropzone` throws for an unregistered dropzone.
- A dropzone is registered in `PageModel.initialize()`, and `initialize()` must be awaited — it is what creates the
  page's sections. Anything creating a page (`FormController.addPage`, a mapper adding pages) has to await it.
- `Dropzone.section`/`page` are snapshots from construction time. `applyTo(section, fieldMap)` takes the *current*
  section for exactly that reason.
- `FormMapper.read` **always** assigns a field's current value, whether or not it has been answered — an untouched
  number field reports `0`, not a missing key. `FormMapper.write` skips `undefined`, so an unmentioned field keeps
  its current value.
- `FormMapper.write(section, definition, data, key, readOnlyFields?)` takes the **source object and key**, not a
  value — `this.write(section, section.city, data, "agencyCity", readOnlyFields)`, mirroring `read`. `key` is
  required, so locking is not opt-in per field: a section method that threads `readOnlyFields` locks every field it
  writes, and one that doesn't simply never locks. `readOnlyFields` is a `ReadOnlyFields<T>` — a mirror of `T`'s own
  shape with `boolean`s in place of values — checked with `readOnlyFields?.[key]` rather than a collection lookup.
  Most section methods for a repeated page's person or unit record are left without the parameter today, so nothing
  in those sub-records is lockable yet, though the type itself is shaped to express it if a mapper wires it up. The
  caller naming a field is a host's `IReportViewerDataManager.read` (see `@forms/report-viewer`); a `readOnlyFields`
  that doesn't mark a key leaves the field editable.
- A concrete field model declares `public readonly value = <default>` as a class-field initializer, which under
  `useDefineForClassFields` runs *after* `FieldModel`'s constructor has assigned `field.value` — so
  `new StringFieldModel({name, label, value: "abc"}).value` is `""`, not `"abc"`. Nothing in production notices,
  because `FieldDefinition.createNew` always passes `""` and real values arrive through `setValue`, which goes
  through `withChanges` and bypasses the constructor. Pinned by a characterization test in
  [test/models/field.test.ts](test/models/field.test.ts).
- `setMode` only ever disables, so a status whose lock is `setMode("viewable")` cannot be reopened by setting the mode
  back: a rejected report is edited again by *loading* it (the fresh form is editable, and its status is restored).
- `form.addPage` / `removePage` throw for a locked page set, so a caller gates on `isPageSetLocked` before offering the
  affordance rather than relying on the throw. `FormController.addPage` therefore rejects for one.
- `WorkflowService.transition` does not save, validate or comment anything; it is a pure function of the form and
  what it is told. The ordering of validate, save the candidate, then apply belongs to the caller.
- `FormController.addPage` copies `isEnabled` only for a page definition's **shared** sections, so after
  `setMode("viewable")` (or `"reviewable"`) a newly added page arrives with its non-shared sections enabled.
- `CompositeRule.getPageDefinition()` answers with its *first* rule's page definition, so a group spanning two page
  definitions is only ever evaluated against the pages of the first.

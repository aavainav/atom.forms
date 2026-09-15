# `@forms/violations`

The registry and service for the violations a citation can be written for, plus the selector that puts them on a
form. Two halves in one package, the way `@forms/printing` is: a registry shaped like
[`@forms/value-lists`](../value-lists/), and a button and panel it **exports** for whoever renders a form to mount.

Depends on `@shrub/core`, `@common/react`, `@common/event-emitter`, `@forms/core`, `@forms/catalog`.
Module dependencies: `FormCatalogModule`.

**This package sits below whatever renders a form, and reaches nothing upward.** It registers its option and panel
nowhere; `@forms/report-viewer` imports them and mounts them itself, gated on the catalog item's own
`violationListId`. That is why there is no dependency on the report viewer here — and why putting the selector on a
form is a change to that form's catalog item, not to this package.

## Files

| Path | Contents |
| --- | --- |
| [src/module.ts](src/module.ts) | `ViolationsModule` + `IViolationsConfiguration` (`registerList`, `registerViolations`). Registers the bundled lists and nothing else. |
| [src/services/violation.ts](src/services/violation.ts) | `IViolationService` (read) / `IViolationRegistrationService` (write) / `ViolationService`. Holds both the lists and the per-form bindings. |
| [src/services/violation-selector.ts](src/services/violation-selector.ts) | `IViolationSelectorService` — `openSelector()` / `onOpenSelector`. Event only; the panel owns whether it is showing. |
| [src/models/violation.ts](src/models/violation.ts) | `IViolation`, `ViolationRow`, `toViolations(rows)`. |
| [src/models/violation-list.ts](src/models/violation-list.ts) | `ViolationList` — a loaded list, its lazy code and category indexes, `getCategories` and `search`. |
| [src/models/violation-list-definition.ts](src/models/violation-list-definition.ts) | `IViolationListDefinition`: `{ id, load() }`. |
| [src/models/violation-binding.ts](src/models/violation-binding.ts) | `IViolationBinding` — the per-form seam. |
| [src/components/violations-option.tsx](src/components/violations-option.tsx) | The `#violations-button` for an options bar, plus `IViolationsOptionProps` (`title`). Raises the event, nothing more. |
| [src/components/violations-panel.tsx](src/components/violations-panel.tsx) | The manager — owns `isOpen` and the newly ticked set, reads the applied set off the form, loads the list, calls the form's `apply`. Takes `IViolationsPanelProps` (`catalogItem`, `controllers`, `onError?`). |
| [src/components/violation-selection-list.tsx](src/components/violation-selection-list.tsx) | The list: category filter, search box, tickable and draggable rows. |
| [src/violations.ts](src/violations.ts) | `ViolationListId` and `standardViolationLists`. **Both empty, deliberately** — see below. |
| [scripts/generate-violation-lists.mjs](scripts/generate-violation-lists.mjs) | The generator, also exposed to form packages as the `generate-violation-lists` bin. |

## Core ideas

**The selector never writes a field, and never reads one either.** The word "violation" does not name the same box
on any two of these forms: the S438 writes its `violation-section`, the Georgia UTC writes its
**`offense-section`** — its own `violation-section` holds the speed detection gear — and the two Oklahoma forms
split the charge across a violation block and a block carrying the money. So a form registers an
`IViolationBinding` handing over an `apply` and a `getApplied`, and it owns where a charge lands, how a second
charge becomes a second page, and how a charge already on the citation is recognised.

**Lists are addressed by id, and registering over an id replaces the list.** That is the extension seam, the same
one value lists have: an agency serves its own current code list by registering a definition under the id the
bundled one used. Ids are namespaced by owner (`sc-s438:violation`, `ok-traffic:violation`), because the registry
is one global namespace and otherwise whichever jurisdiction loaded last would claim `violation`.

**This package bundles no lists at all.** `standardViolationLists` is empty and `ViolationListId` has no entries,
which is the point rather than an omission: a violation code list belongs to the agency writing the citations and
there is no national one, so every list is declared in the form package that draws on it.

## The gate — declared, not inferred

Whether a form is offered the selector is decided by **the form**: a `FormModel` self-describes `violationListId`,
and `@forms/report-viewer` mounts the option and the panel on `!!form.violationListId`.

A form declaring a list is expected to `registerViolations` a binding too, since the panel needs an `apply` and a
`getApplied` to do anything; both go in the same `configure()` call, next to each other. `getBinding` answering
`undefined` is handled gracefully — the panel renders and the Add button does nothing — rather than being a second
gate, because a form that declared a list and forgot its binding is a bug to see, not a feature to hide.

This replaced a `canShow` that asked the binding registry *plus* `catalogItem.ctor.prototype instanceof
CitationForm`. The declaration is the better gate: it is the form saying what it draws on, in the one place a form's
whole registration lives, rather than the renderer working it out from what happened to be registered elsewhere.

## Reporting a failure

Neither component resolves a notification service. The panel takes an `onError?: (message: string) => void` and
calls it when a list cannot be loaded or a chosen violation cannot be applied; whoever mounts it wires that to their
own notifications. Notifications belong to the host of a panel rather than to the panel — and this package sits
below the report viewer, so it could not reach that one anyway.

## Why an off canvas and not a modal

A modal's backdrop covers the form, and a violation has to be draggable out of the selector and onto the citation
behind it. The panel is therefore an `FOffCanvas` with `placement="end"` — the validation panel holds the start
edge, and both can be open at once.

It has to be mounted somewhere that is **not** the options bar, and never rendered from the option itself: the bar
is `position-fixed` and so a stacking context, and anything fixed inside it is ranked only against the bar's own
contents however high its z-index. The report viewer mounts it at its own root instead, beside `ModalManager` and
`ValidationManager`. This is the same trap `@forms/printing` documents for its modal.

## Loading and caching

- `ViolationService` caches the **promise** per id, so a selector opened twice before the first load settles shares
  one load; a rejected load is evicted so the next request retries.
- The panel loads the list when it is **first opened**, not when the form loads, so the chunk carrying a
  jurisdiction's code list is never fetched by an officer who does not open the selector.
- `ViolationList` builds its code and category indexes lazily. `search(term, category?)` narrows by category
  first, then matches over code, statute and description, ordering matches whose code or statute **starts with**
  the term ahead of the rest — an officer typing a section number knows which charge they want.
- The selector filters the loaded list in the component rather than going back through the service, because a search
  runs per keystroke and the rows are already in hand. It derives its category options the same way.

## A violation already on the citation

A charge the citation carries shows **ticked and locked** in the list, whichever way it got there — chosen and
added, or dragged onto the form. The boxes it filled on the form are **disabled** too, so a charge that came from
the code list is not quietly typed over. The way to take one off is to delete the page carrying it, which frees
the row again and re-enables it.

**Locking the row means locking the drag with it.** The row carries two ways onto the citation, the tick and the
drag, and stopping only the tick leaves the other open: a locked violation dragged onto a *different* page would
put the same charge on the citation twice. So the row's `FDraggableItem` is disabled along with its checkbox.

That makes the panel add-only, which is what keeps it non-destructive: nothing in it can remove a charge, and the
one action that can — deleting a page — already goes through the report viewer's delete-page confirmation.

Three pieces make it work:

- **`IViolationBinding.getApplied(controllers, violations)`** narrows the loaded list to what the form carries.
  The form owns it because only the form knows what it wrote: the S438 and the Georgia UTC store the statute where
  the two Oklahoma forms store the agency's own code, so each matches on its own box. It answers with a subset of
  the list rather than bare codes, so the panel never matches a stored string back to a row itself.
- **The panel reads the form through `useForm`**, not off the controller once. The panel is mounted for the life
  of the form, so without the subscription it would still be showing whatever the citation held when it was last
  opened — and deleting a page while the panel is open would leave a row ticked for a charge that had gone.
- **The `apply` methods disable the boxes they fill.** Only the boxes the violation itself fills: the S438's date
  and time of violation sit in the same section but are the officer's, not the charge's, and stay editable.

The cap counts applied and newly ticked together, so a citation already carrying five charges offers no more.
`apply` is handed only the newly ticked ones — applying one already on the form would write a second page for a
charge it already has.

## Categories

`IViolation.category` is optional free text, not an enum: the grouping belongs to the agency publishing the code
list, and two jurisdictions do not divide their codes the same way — South Carolina's list groups by the kind of
offence, Oklahoma City's parking list by the kind of place.

The selector offers the filter **only when the loaded list turns out to have categories**, rather than showing a
control whose menu holds nothing but "All categories". A row shows its own category underneath the description
only while no category is filtering the list, since repeating the chosen one on every row says nothing.

The control is a plain bootstrap `<select>` rather than an `FFieldSelect`. `FFieldSelect` is built for a coded
form field bound to a value list, and its menu always spells an option out as `"value - description"`; a category
has no code, so every row would read "Speed - Speed". A filter over a panel is not a field on the form — the print
dialog reaches for plain markup for the same reason.

## The generator

`yarn generate` → `node ./scripts/generate-violation-lists.mjs --data ./data --out ./src/generated --row-import ../models/violation`

Form packages run the same script through the `generate-violation-lists` bin with the default
`--row-import @forms/violations`. The lists to emit are declared by `<data>/lists.json`, so the script carries no
knowledge of the package running it.

Source rows are `{code, description, category?, statute?, fine?, points?, isLocalOrdinance?,
requiresCourtAppearance?}` and are emitted as `ViolationRow` tuples **trimmed to their last present field**, so a
list carrying neither fines nor points costs two entries a row. A gap in the middle is held open with an
`undefined`; a run of absent fields at the end is dropped. The generator rejects a field of the wrong type, an
empty string, and any key that is not a field of a violation.

**The row order is by how often a field is filled in, not by how important it is** — that is why `category` sits
third, ahead of `statute`. A field that is usually present but placed late costs a placeholder on every row that
carries it, which is exactly what the tuple exists to avoid. Reordering the tuple means regenerating every
`src/generated/` that was emitted from an older order.

The dynamic-import rule from `@forms/value-lists` applies here too: **never statically import anything under
`src/generated/`**, including a type-only import a later edit might turn into a value import, or the list folds
back into the entry chunk and the code split silently stops working.

## Recipes

**Add a list owned by a form**: JSON in that package's `data/` (or an inline `load` where there is nothing to
generate from) → `data/lists.json` → `yarn generate` → an id in its `src/violations.ts` → register it from the
form module's `configure` through `IViolationsConfiguration.registerList`.

**Put the selector on a form**: mark the form's shared sections `{ isShared: true }` in its schema → add
`applyViolations(controllers, violations)` and `getAppliedViolations(controllers, violations)` to its service,
disabling the boxes the violation fills in both `applyViolations` and the dropzone's apply → subclass
`ViolationDropzone` and register it in the page model's `initialize()` → wrap the charge section in `<FDropzone>` →
`registerViolations` from `configure`, wiring both `apply` and `getApplied` → **declare `violationListId` on the
catalog item**, which is what actually puts the button on the form → make the mapper handle repeating pages. See
[`@forms/s438`](../south-carolina/s438/) for the worked example.

**Serve a list from a host**: `registerList` a definition under the same id from a module that depends on the one
that registered it. Later registration wins, and anything cached under the id is dropped.

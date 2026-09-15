# `@forms/public-contact-or-warning` — SC Form 432 (Public Contact / Warning)

Catalog identity: **name `"SC Form 432 - Public Contact / Warning"`, version `"1.0"`**. Sandbox route `sc/432`, which the host owns. Module name
`public-contact-or-warning`. Form type **`"none"`** (extends `FormModel` directly — it is neither a citation nor a
crash). Form factory version string `"v2025"`.

The record completed when a stop results in no citation and no arrest, per SC Code 56-5-6560(A).

The **middle-sized** form package: one page, fixed (no repeating pages), a synchronous mapper, but with option
fields and its own value lists. Reach for this one as the template for a single-page form with code lists.

## Structure

```
record-page  9 sections: agency, person, route, stop, vehicle, officer,
                         nature-of-contact, primary-reason, searches
```

11 section components for 9 sections — `person-race-section.tsx` and `latitude-longitude-section.tsx` both bind to
the **person** section, splitting it visually to match the printed form.

2 dropzones: `RecordPagePersonDropzone`, `RecordPageVehicleDropzone`.

## Files

| Path | Contents |
| --- | --- |
| [src/models/public-contact-or-warning-form-schema.ts](src/models/public-contact-or-warning-form-schema.ts) | **Read first** (~258 lines). The whole definition tree; `ruleCollection` delegates to `createRuleCollection(this)`. |
| [src/models/public-contact-or-warning-rules.ts](src/models/public-contact-or-warning-rules.ts) | `createRuleCollection(schema)` — ~166 lines, grouped by section with the `natureOptions` / `primaryReasonOptions` checkbox arrays declared at the top. |
| [src/models/public-contact-or-warning-form.ts](src/models/public-contact-or-warning-form.ts) | `PublicContactOrWarningFormModel`. Adds the rule collection in `initialize()`; `getRecordPageCollection()`. |
| [src/models/record-page/](src/models/record-page/) | `record-page.ts` + one file per section + `dropzones/`. |
| [src/components/](src/components/) | Root form, route loader, and `record-page/` mirroring the models tree. |
| [src/mapping/public-contact-or-warning-data.ts](src/mapping/public-contact-or-warning-data.ts) | `IPublicContactOrWarningData` — **flat**, ~70 optional fields. Option fields are typed `IOptionValue`. |
| [src/mapping/public-contact-or-warning-mapper.ts](src/mapping/public-contact-or-warning-mapper.ts) | `populate` is **synchronous**; one `extract`/`populate` pair per section, adjacent. Every section method threads `readOnlyFields`, so any field a host's `IReportViewerDataManager.read` marks `true` comes back locked — the agency section is simply the one the sandbox demonstrates it on (`/sc/432?record=new`), locking the agency name while leaving city and county editable. |
| [src/services/public-contact-or-warning.ts](src/services/public-contact-or-warning.ts) | `IPublicContactOrWarningService` — 2 `apply*Dropzone`, 6 `get*Options`, and `resolveVehicleDropzone`. |
| [src/value-lists.ts](src/value-lists.ts) | `PublicContactOrWarningValueListId` + `publicContactOrWarningValueLists`. |
| [src/generated/](src/generated/) · [data/](data/) | 2 generated lists (counties, race-ethnicities) + their source JSON and `lists.json`. |
| [src/module.ts](src/module.ts) · [form-factory.ts](src/form-factory.ts) · [bootstrapper.ts](src/bootstrapper.ts) · [options.ts](src/options.ts) | Wiring. `options.ts` is currently empty. |

## Value lists

Owned by this form, ids prefixed `sc-432:` (see [`@forms/value-lists`](../../value-lists/CLAUDE.md) for why):

| Id | Source |
| --- | --- |
| `sc-432:county` | generated from `data/counties.json` |
| `sc-432:race-ethnicity` | generated from `data/race-ethnicities.json` (the legacy codes this record was built against) |
| `sc-432:gender` | **hand-written inline** — three values, no code list to generate from, but still goes through the registry so there is one way a list is reached |

Also drawn from `@forms/value-lists`: `ValueListId.state`, `vehicleMake`, `vehicleModel` (national code sets).

`yarn generate` regenerates `src/generated/` from `data/lists.json`. Never statically import from `src/generated/`.

## The vehicle make/model dependency

The one dependent select on this form, and the whole of the dependency is two lines:

- **UI** ([components/record-page/vehicle-section.tsx](src/components/record-page/vehicle-section.tsx)): the model
  `FFieldSelect` gets `parentValue={make.getValue().value}`, which reaches the loader as its argument and joins the
  cache key. No field carries any notion of another field.
- **Clearing**: `setOptionWithDependents(binding, section.make, [section.model])` moves both in one update, so the
  record is never momentarily holding a model belonging to a make it no longer has.

**Dropped vehicles need resolving before applying.** A drop carries make/model as *names* with no codes, so
`record-page.tsx` calls `service.resolveVehicleDropzone(dropzone)` (async, consults the value lists) and only then
`applyVehicleDropzone` inside the update. The make resolves first — a model name only identifies a model underneath
a make. An unrecognized name is **cleared** rather than carried onto the form.

## Rules worth knowing

- `RequiredSelectionRule` on the nature-of-contact group (21 options) and the primary-reason group — reported once
  against an anchor field so an unanswered group doesn't mark the whole section in error.
- The primary-reason group's requirement is gated:
  `.when(new FieldValueCondition(primaryReason.primaryReasonOtherSpecify, ComparisonOperator.isEmpty))`.
- "Other" checkboxes require their explanatory text via
  `.when(new FieldValueCondition(nature.natureOther, ComparisonOperator.equals, true))`.
- Coordinates use `coordinatePattern = /^-?\d+\.\d{5}$/` — **exactly five** decimal digits — plus a
  `NumberRangeFieldRule` for the ±90 / ±180 bounds.
- `CompositeRule.and(field, f => [...])` is used to stack length + alphanumeric on the CAD call number.

## Recipes

**Add a field**: schema `defineFields` → `IPublicContactOrWarningFormSchema` interface → section model → section
component → `IPublicContactOrWarningData` → the mapper's `extract`/`populate` pair → a rule in
`createRuleCollection` if needed.

**Add an option field backed by a new list**: drop the JSON in `data/`, add it to `data/lists.json`, `yarn generate`,
add the id to `PublicContactOrWarningValueListId` and a dynamic-`load` definition to
`publicContactOrWarningValueLists`, add a `get*Options` method to the service, then use `FFieldSelect` with
`options={loadXOptions}` (wrapped in `useCallback`).

**Add a checkbox to a mutually-exclusive group**: add it to `defineFields`, the section model, the component, the
data contract, the mapper, **and** the corresponding options array at the top of
`public-contact-or-warning-rules.ts` — the `RequiredSelectionRule` will not see it otherwise.

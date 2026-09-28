# `@forms/tr310` — SC TR-310 Traffic Collision Report

Catalog identity: **name `"SC TR-310 - Traffic Collision Report"`, version `"1.0"`**. Sandbox route `sc/tr310`, which the host owns. Module name
`tr310-crash-form`. Form type `"crash"` (extends `CrashForm`). Form factory version string `"v2024"`.
SC TR-310 (Rev. 7/2024).

The **largest and most complete** form package: four pages, **two of which repeat**, 55 value lists, an
**asynchronous** mapper, and shared code-box components. Reach for this one as the template for any form with
repeating pages, and read its mapper before writing one that has to create pages.

## Structure

| Page | Cardinality | Sections |
| --- | --- | --- |
| `collision-page` | once | 14: header, collision, route, base-intersection, second-intersection, coordinates, trafficway, barrier, conditions, harmful-event, junction, work-zone, witness, collision-officer |
| `person-page` | **one per person involved** | 11: person-header, person, driver-license, driver-actions, occupant, non-motorist, injury, safety-equipment, alcohol-drugs, passengers, person-officer |
| `unit-page` | **one per unit involved** | 11: unit-header, vehicle, insurance, owner, travel, damage, unit-type, events, roadway, violations, unit-officer |
| `narrative-page` | once | 5: narrative-header, narrative, diagram, additional-passengers, narrative-officer |

A form opens with one of each. The four groups render as **one continuous tab strip** in printed order; the person
and unit groups carry the add/delete affordances.

Dropzones: `PersonPagePersonDropzone` (person page); `UnitPageVehicleDropzone`, `UnitPageOwnerDropzone` (unit page).

## Files

| Path | Contents |
| --- | --- |
| [src/models/tr310-form-schema.ts](src/models/tr310-form-schema.ts) | **~1,105 lines.** The whole definition tree. Grep for `readonly <name>Fields` to find a section's field block rather than reading it through. |
| [src/models/tr310-rules.ts](src/models/tr310-rules.ts) | `createRuleCollection(schema)`, ~165 lines. |
| [src/models/tr310-form.ts](src/models/tr310-form.ts) | `TR310FormModel extends CrashForm`. Page accessors, `getCrashData()`, and the date/time stamping. |
| [src/models/<page>/](src/models/) | Page model + one file per section + `dropzones/`. |
| [src/components/fields.tsx](src/components/fields.tsx) | **Shared building blocks — use these, don't hand-roll.** `CodeBox`, `CodeLegend`, `CodedField`, `TextField`, `useOptions`. |
| [src/components/passenger-rows.tsx](src/components/passenger-rows.tsx) | `IPassengerRow` (14 columns) + the renderer. The person page and narrative page print the same row under different names and share this. |
| [src/components/<page>/](src/components/) | One `.tsx` per section, mirroring the models tree. |
| [src/mapping/tr310-data.ts](src/mapping/tr310-data.ts) | ~712 lines. `ITR310PersonData`, `ITR310UnitData`, and `ITR310Data` (the flat collision+narrative fields plus `persons?` and `units?` arrays). Every doc comment names the printed box label and its section. |
| [src/mapping/tr310-mapper.ts](src/mapping/tr310-mapper.ts) | ~1,241 lines. `populate` is **async**. |
| [src/services/tr310.ts](src/services/tr310.ts) | ~467 lines: 3 `apply*Dropzone` plus a `get*Options` per value list. |
| [src/value-lists.ts](src/value-lists.ts) | `TR310ValueListId` (55 entries) + `tr310ValueLists`. |
| [src/generated/](src/generated/) · [data/](data/) | 55 generated modules + 55 source JSON files + `lists.json`. |
| [src/module.ts](src/module.ts) · [form-factory.ts](src/form-factory.ts) · [bootstrapper.ts](src/bootstrapper.ts) · [options.ts](src/options.ts) | Wiring. `options.ts` is currently empty. |

## Repeating pages — the part that differs from the other forms

**`TR310Mapper.populate` returns a `Promise`.** `addPages(form, pageDefinition, count)` loops
`await pageDefinition.createPage(form).initialize()` until the collection holds at least `count` pages —
`initialize()` is what creates a page's sections and registers its dropzones, so it must be awaited.

Pages **beyond** the end of `data.persons` / `data.units` are **left alone, not removed**, so data mentioning fewer
units than the form holds never silently discards a page an officer added.

Read side: `data.persons = form.getPersonPages().map(page => this.extractPersonRecord(page))`.

## Value lists

55 lists, all owned by this report, ids prefixed `sc-tr310:` — the TR-310 prints a code legend beside nearly every
box it carries. `data/` and `src/generated/` are 1:1 with `TR310ValueListId`.

Also drawn from `@forms/value-lists`: `ValueListId.state`, `vehicleMake`, `vehicleModel`.

`yarn generate` regenerates `src/generated/` from `data/lists.json`. **Never statically import from
`src/generated/`** — with fifty-odd code sets there is a great deal to keep out of the entry chunk, and a static
import (including a type-only one a later edit turns into a value import) silently defeats the split.

## The code box pattern

The printed form pairs a numbered box with a legend of the codes it accepts. `CodedField` renders both **from the
same options**, so the legend cannot drift from what the box will accept. `CodeBox` shows the code alone as the
paper form does, while the open menu shows code plus description.

```tsx
<CodedField
    field={section.getLight()}
    load={loadLightConditionOptions}   // useCallback around service.getLightConditionOptions()
    title="Light Condition"
    onChange={(value) => binding.setValue(section.light, value)}
/>
```

## Form self-stamping — the pattern to copy

Unlike the S438, `TR310FormModel`'s setters **return `this`** and thread the change back through the page
collection (`setCollisionValue`), so `initialize()` can chain
`setDateOfCrash().setTimeOfCrash().setCrashNumber().addRuleCollection(...)`. This is the correct shape for an
immutable model.

- `setDateOfCrash` stamps `YYYY-MM-DD` and **disables** the box. That order is deliberate: it is the only order
  `DateRangeFieldRule` parses, and an unparseable value silently skips date validation.
- `setTimeOfCrash` stamps the time but leaves it editable.
- `setCrashNumber` **returns the form unchanged** — the SCDPS report number is assigned by the state and arrives
  with the host's data.

## `personHeaderPersonId` / `unitHeaderUnitId` — a hidden id that survives a save

Every person and unit page needed an id of its own that outlives a reload, so the *same* person keeps the *same* id
after every save instead of getting a fresh random one each time. Rather than reach into `Entity.id`, each carries an
ordinary hidden field: `HiddenFieldModel` (`@forms/core`), a field type that behaves exactly like a string field --
the distinct type is what marks it as one no component should ever bind to, so it can't be wired into the UI by
accident. `PersonPageModel`/`UnitPageModel.initialize()` stamp it with `crypto.randomUUID()` the moment the page is
created, the same way the form's own `initialize()` self-stamps its date, time and ticket number. From there it's an
ordinary field: `extractPersonHeader`/`extractUnitHeader` read it, `populatePersonHeader`/`populateUnitHeader` write
it, through the same `this.read`/`this.write` every other field goes through. A record saved before this field
existed carries none, so the standard "a field the data omits keeps its current value" rule leaves the page's freshly
stamped id alone -- nothing breaks, there's just nothing yet to restore.

Nothing reads this id yet; it only makes a page's identity durable across a reload, which the next piece of work
(relating a person to a unit by reference instead of a typed number) needs to exist first.

## `getCrashData()` vs `ITR310Data`

Two different contracts, don't confuse them:

- **`getCrashData(): ICrash`** — the common summary every crash form publishes (`@forms/core`). Lossy by design:
  boxes the TR-310 has no equivalent for are left blank rather than invented, and per-unit `passengers` is always
  `[]` because the report records passengers per person page.
- **`ITR310Data`** — the complete, round-trippable contract the mapper deals in. This is what the report viewer
  populates from and saves to.

Local helpers `text(field)` / `count(field)` in `tr310-form.ts` collapse the array case of a string/number field;
no box on the TR-310 is a list, so an array means something outside the report wrote to it, and joining beats
dropping.

## Rules worth knowing

`tr310-rules.ts` opens with the code constants the conditions compare against — `yes = "1"`, `driver = "1"`,
`nonMotorist = "3"` — plus `coordinatePattern` (a plain signed decimal here, unlike the SC 432's five-digit one),
`wholeNumberPattern` and `platePattern`. Fields are pulled into short locals per section at the top of
`createRuleCollection`, so a new rule usually needs no new import.

## Recipes

**Add a field**: schema `defineFields` → `ITR310FormSchema` interface → section model → section component (use
`CodedField`/`TextField`) → `ITR310Data` (or `ITR310PersonData`/`ITR310UnitData` for a repeating page) → the
mapper's `extract`/`populate` pair → a rule if needed.

**Add a value list**: JSON in `data/` → entry in `data/lists.json` → `yarn generate` → id in `TR310ValueListId` →
dynamic-`load` definition in `tr310ValueLists` → `get*Options` on `ITR310Service` and `TR310Service` → use it via
`CodedField`.

**Add a section**: schema section + fields → `src/models/<page>/<name>-section.ts` → the page model
(`readonly xSection` + `getXSection()`) → `src/components/<page>/<name>-section.tsx` → render it in the page
component → an `extract`/`populate` pair in the mapper's per-page block.

**Add a page type**: page model + its sections → `DefinitionFactory.page` in the schema → `TR310FormModel`
(`readonly xPage`, `getXPageCollection()`, and `getXPages()` if it repeats) → a group in `tr310-form.tsx` → for a
repeating page, an `ITR310XData` array on the contract plus `addPages` handling in `populate`.

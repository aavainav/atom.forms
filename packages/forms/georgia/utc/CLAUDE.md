# `@forms/ga-utc` — Georgia Uniform Traffic Citation, Summons, and Accusation

Catalog identity: **name `"GA Uniform Traffic Citation"`, version `"1.0"`**. Route `ga/utc`. Module name
`ga-utc-form`. Form type `"citation"` (extends `CitationForm`). Form factory version string `"v2026"`.

City of Atlanta Department of Police. Form APD 008E Rev 4/10 = DPS-32C (1/02), authorized under GA Code 40-13-1 and
D.P.S. Reg. 375-3-4-.01. Two pages, both fixed, a synchronous mapper, ~167 fields.

**The checkbox-heavy form.** Where the other citations take codes in boxes, this one prints rows of tick boxes, so
reach for this package as the template for a form whose answers are checkboxes rather than coded fields.

## Structure

```
citation-page  12 sections: header, violator, vehicle, status, violation, dui, offense,
                            conditions, location, officer, summons, certification
court-page      4 sections: court-action, plea, disposition, judgment
```

The citation page is the five sections the paper numbers I through V, split where a printed section holds more than
one block of boxes: Section I becomes violator + vehicle + status, and Section II becomes violation + dui + offense
+ conditions. The court page is the reverse of the court's copy, completed by the clerk and the judge.

2 dropzones, both on the citation page: `CitationPageViolatorDropzone` (person), `CitationPageVehicleDropzone`
(make + model + year).

## Files

| Path | Contents |
| --- | --- |
| [src/models/utc-form-schema.ts](src/models/utc-form-schema.ts) | **Read first.** The whole definition tree. Grep for `readonly <name>Fields` to find a section's field block. |
| [src/models/utc-rules.ts](src/models/utc-rules.ts) | `createRuleCollection(schema)`, with the patterns it compares against declared at the top. |
| [src/models/utc-form.ts](src/models/utc-form.ts) | `GAUTCFormModel extends CitationForm`. |
| [src/models/exclusive-group.ts](src/models/exclusive-group.ts) | `selectExclusive` — **the pattern that makes this form work.** See below. |
| [src/models/<page>/](src/models/) | Page model + one file per section + `dropzones/`. |
| [src/components/fields.tsx](src/components/fields.tsx) | **Shared building blocks — use these, don't hand-roll.** `TextBox`, `NumberBox`, `SelectBox`, `CheckBox`, `OptionBox`. |
| [src/components/<page>/](src/components/) | One `.tsx` per section, mirroring the models tree. |
| [src/mapping/utc-data.ts](src/mapping/utc-data.ts) | `IGAUTCData` — **flat**, ~167 optional fields, alphabetical. Every doc comment names the printed box and its section. |
| [src/mapping/utc-mapper.ts](src/mapping/utc-mapper.ts) | `populate` is **synchronous**; one `extract`/`populate` pair per section, adjacent. |
| [src/services/utc.ts](src/services/utc.ts) | `IGAUTCService` — 2 `apply*Dropzone`, 5 `get*Options`, `resolveVehicleDropzone`. |
| [src/value-lists.ts](src/value-lists.ts) | `GAUTCValueListId` + `gaUtcValueLists`. Both lists are inline; there is no `data/` and no `yarn generate`. |
| [src/module.ts](src/module.ts) · [form-factory.ts](src/form-factory.ts) · [bootstrapper.ts](src/bootstrapper.ts) · [options.ts](src/options.ts) | Wiring. `options.ts` is currently empty. |

## The exclusive group pattern — read this before touching a checkbox

The framework has no radio or enum field type, so a printed row of boxes answering **one** question is modelled as
a group of `BooleanFieldModel` fields plus a `select*` method on the section that goes through
[`selectExclusive`](src/models/exclusive-group.ts). It checks the chosen box and clears the rest **in one update**,
so the group holds exactly one box, or none.

```tsx
// the section exposes the group and a select* method per group
public readonly cdl: ReadonlyArray<FieldDefinition<BooleanFieldModel>> = [this.cdlYes, this.cdlNo];
public selectCdl(selected: FieldDefinition<BooleanFieldModel>): this { return selectExclusive(this, this.cdl, selected); }

// the component renders each member as an OptionBox and selects through that method
<OptionBox field={cdlYes} onSelect={() => binding.update((current) => current.selectCdl(current.cdlYes))} />
```

**Which boxes are a group and which are independent** is a judgement about the paper, and it is the one thing to
get right when adding a box:

- **Grouped** (`OptionBox` + a `select*` method) — the options answer a single question and cannot both be true:
  every YES/NO pair (CDL, accident, injuries, fatalities, companion case, licence displayed), both AM/PM pairs,
  state law / local ordinance, copy / jail, VASCAR / laser / radar, patrol vehicle / other, the DUI test
  administered, all five conditions columns, and the three disposition groups.
- **Independent** (`CheckBox`, toggled with `binding.setValue`) — the box is its own flag: 2-lane road, driver
  requested accuracy check, the DUI box itself, the three commercial violation boxes, and the two schools and the
  assessment in the disposition block.

An `OptionBox` renders as a radio and so **cannot be unticked by clicking it again**; a group is left unanswered by
never ticking it. That is deliberate — leaving both halves of a YES/NO pair clear is how the citation records a
question the officer did not answer, which is not the same as a no.

## Value lists

Two, both owned by this form, ids prefixed `ga-utc:`, and both **written inline** rather than generated — neither
has a published code set to generate from:

| Id | Contents |
| --- | --- |
| `ga-utc:county` | Fulton, DeKalb, Clayton — the three the citation prints beside the box, not Georgia's 159 |
| `ga-utc:sex` | M / F / U |

Also drawn from `@forms/value-lists`: `ValueListId.state` (violator, licence and registration boxes), `vehicleMake`,
`vehicleModel`.

The vehicle make/model dependency is the usual one: `parentValue={make.getValue().value}` on the model `SelectBox`,
`setOptionWithDependents(binding, section.make, [section.model])` for clearing, and
`service.resolveVehicleDropzone(dropzone)` awaited in `citation-page.tsx` before the drop is applied, because a drop
carries make and model as *names* with no codes.

## Decisions worth knowing before you change something

- **There is no single date box on this citation.** The paper prints the offense date as separate month / day / year
  boxes and its time as hour / minute / AM-PM, so `setDateOfViolation` and `setTimeOfViolation` each write several
  fields in one update via `updateCitationPageSection`. The month is the **three letter abbreviation** the paper
  prints (`Sep`) and the year its **last two digits**.
- **The two full date boxes — DOB and licence expiry — are stored `YYYY-MM-DD`**, the only order
  `DateRangeFieldRule` parses, and are rendered with `type="date"`. An unparseable value silently skips date
  validation.
- **`setTicketNumber` returns the form unchanged** — the citation number is preprinted on the ticket book and
  assigned by the agency, so it arrives with the host's data.
- **Race, hair and eye colour are free text.** The printed form takes a write-in code in each, but Atlanta publishes
  no code set for them; inventing codes would be worse than a text box. Turning one into a coded box is an entry in
  `value-lists.ts`, a `get*Options` on the service, and a change of constructor in the schema.
- **Race and sex are two fields** even though the paper prints them as one slashed `(Race/Sex)` box: a record
  carrying one and not the other has nowhere to go in a single box.
- **Last name and suffix are two fields**, for the same reason — the paper prints `(Last, Suffix)` as one box.
- **The court page carries no required rules.** It is completed by the clerk and the judge days after the citation
  is served, and an officer saving a citation has no business being told the disposition is missing.
- **Every box on the court action block is a string**, including the ones that read as yes/no questions — the clerk
  writes a date or a note on the warrant issued and served lines rather than ticking them.
- **The paper misspells "Warrant" as "Warrent"** on both court-action lines. The fields are `warrantIssued` /
  `warrantServed` and the labels are spelled correctly; only the doc comments record the printed typo.
- **Name collisions with the framework.** `SectionModel` already declares `name` and `Entity` declares `id`, so a
  field definition cannot be called either. Hence `officerName`, `secondOfficerName`, `courtName`, `accusedName`,
  `judgeName`, and the vehicle's `registrationNumber`.

## Recipes

**Add a field**: schema `defineFields` → `IGAUTCFormSchema` interface → section model → section component (use
`TextBox`/`NumberBox`/`SelectBox`/`CheckBox`/`OptionBox`) → `IGAUTCData` → the mapper's `extract`/`populate` pair →
a rule in `createRuleCollection` if needed.

**Add a checkbox to an exclusive group**: add it to `defineFields`, the section model's field list **and its group
array**, the component (as an `OptionBox` calling the group's `select*`), the data contract, and the mapper. Missing
the group array is the failure that looks like a working box which never clears its neighbours.

**Add a section**: schema section + fields → `src/models/<page>/<name>-section.ts` → the page model
(`readonly xSection` + `getXSection()`) → `src/components/<page>/<name>-section.tsx` → render it in the page
component → an `extract`/`populate` pair in the mapper's per-page block.

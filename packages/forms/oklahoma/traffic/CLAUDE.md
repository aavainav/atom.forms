# `@forms/ok-traffic` — OKC Traffic Citation

Catalog identity: **name `"OKC Traffic Citation"`, version `"1.0"`**. Sandbox route `ok/traffic`, which the host owns. Module name
`ok-traffic-form`. Form type `"citation"` (extends `CitationForm`). Form factory version string `"v2026"`.

Oklahoma City Municipal Court traffic citation and complaint. Three pages, all fixed, a synchronous mapper, ~101
fields. The largest of the Oklahoma forms.

## Structure

```
complaint-page   11 sections: header, defendant, license, description, vehicle, violation,
                              offense, violation-information, officer, sworn, arraignment
                 repeats: one complaint page per violation the citation is written for
warrant-page      3 sections: complaint, certification, warrant
supplement-page   4 sections: witness, registered-owner, status, notes
```

**`violation`, `offense` and `violation-information` are per-page; the other eight complaint-page sections are
`{ isShared: true }`.** The warrant and supplement pages appear once each.

3 dropzones, all on the complaint page: `ComplaintPageDefendantDropzone` (person),
`ComplaintPageVehicleDropzone` (make + model + year), `ComplaintPageViolationDropzone`.

## Files

| Path | Contents |
| --- | --- |
| [src/models/traffic-form-schema.ts](src/models/traffic-form-schema.ts) | **Read first.** The whole definition tree. Grep for `readonly <name>Fields` to find a section's field block. |
| [src/models/traffic-rules.ts](src/models/traffic-rules.ts) | `createRuleCollection(schema)`, with the patterns and codes it compares against declared at the top. |
| [src/models/traffic-form.ts](src/models/traffic-form.ts) | `OKTrafficFormModel extends CitationForm`. |
| [src/models/<page>/](src/models/) | Page model + one file per section + `dropzones/`. |
| [src/components/fields.tsx](src/components/fields.tsx) | **Shared building blocks — use these, don't hand-roll.** `TextBox`, `NumberBox`, `SelectBox`, `YesNoBox`. |
| [src/components/<page>/](src/components/) | One `.tsx` per section, mirroring the models tree. |
| [src/mapping/traffic-data.ts](src/mapping/traffic-data.ts) | `IOKTrafficData` — **flat**, ~101 optional fields, alphabetical. Every doc comment names the printed box label and its section. |
| [src/mapping/traffic-mapper.ts](src/mapping/traffic-mapper.ts) | `populate` is **synchronous**; one `extract`/`populate` pair per section, adjacent. |
| [src/services/traffic.ts](src/services/traffic.ts) | `IOKTrafficService` — 2 `apply*Dropzone`, 6 `get*Options`, `resolveVehicleDropzone`. |
| [src/value-lists.ts](src/value-lists.ts) · [data/](data/) · [src/generated/](src/generated/) | The three owned lists and the county source data. |

## Print copies

Registered with `@forms/printing` in [src/module.ts](src/module.ts). The citation is a multi-part set on paper, and
which pages a part carries depends on who receives it:

| Id | Name | Pages | Layout |
| --- | --- | --- | --- |
| `violator` | Violator copy | complaint, warrant | side by side — one landscape sheet |
| `court` | Court copy | complaint, supplement | top down — a fresh sheet per page |

The complaint page is about 17.5in tall, so the violator copy is scaled to roughly 42% to get both pages onto the
one sheet, while the court copy prints near full size and lets the complaint run onto a second sheet. Either can be
flipped to the other layout in the print dialog. To make the violator copy larger, give the profile
`paper: "legal"` or pin a `scale`.

## Value lists

| Id | Source |
| --- | --- |
| `ok-traffic:county` | generated from `data/counties.json` — Oklahoma's 77 counties |
| `ok-traffic:sex` | hand-written inline (M/F/U) |
| `ok-traffic:yes-no` | hand-written inline (Y/N) — every Y/N box on the form shares it |

Also drawn from `@forms/value-lists`: `ValueListId.state` (defendant, license, tag, witness, owner, trailer),
`vehicleMake`, `vehicleModel`.

## The `YesNoBox` pattern

The form carries a dozen Y/N boxes across three sections. All of them go through `YesNoBox`, which is a
`SelectBox` pinned to `OKTrafficValueListId.yesNo` with `format="valueOnly"` — so they share one cache key and
cost **one load between them** however many are rendered. The box shows the letter the form prints; the menu it
opens spells out YES and NO.

## The vehicle make/model dependency

The one dependent pair on the form, and both fields sit on the **same** section, so the full pattern applies:

- **UI** ([components/complaint-page/vehicle-section.tsx](src/components/complaint-page/vehicle-section.tsx)): the
  model `SelectBox` gets `parentValue={make.getValue().value}`, which reaches the loader as its argument and joins
  the cache key. No field carries any notion of another field.
- **Clearing**: `setOptionWithDependents(binding, section.make, [section.model])` moves both in one update.
- **Dropped vehicles need resolving first**: a drop carries make/model as *names* with no codes, so
  `complaint-page.tsx` awaits `service.resolveVehicleDropzone(dropzone)` before applying it. The make resolves
  first — a model name only identifies a model underneath a make. An unrecognized name is **cleared** rather than
  carried onto the form.

## The violation selector

The list is `ok-traffic:violation`, written **inline** in [src/violations.ts](src/violations.ts) — Oklahoma City
publishes no machine-readable offence code list, so the codes and scheduled fines need checking against the
current municipal code.

`OKTrafficService.applyViolations` spreads one violation across two sections, because the paper does: the code
goes in the violation block's **Muni Code** and the statute in its **Off Code**, while the fine goes to the offense
block's **Amount Due**. The citation prints no box for the charge in words at all, so the description lands in
**Offense Notes**, the only place on the paper it can be read. The date, time, county and location are carried
across from the first page, since they sit in the violation section rather than a shared one and one stop produces
one of each.

## Decisions worth knowing before you change something

- **Dates are stored `YYYY-MM-DD`**, not the `MM/DD/YYYY` the form prints — the only order `DateRangeFieldRule`
  parses. An unparseable value silently skips date validation.
- **County codes are alphabetical positions 1–77** (Oklahoma's license-plate numbering). If OKC's set differs,
  edit `data/counties.json` and run `yarn generate`.
- **The supplement page registers no person dropzone.** Its registered owner is a single `Name` box, where the
  complaint page carries first/middle/last; a dropped person's name has nowhere to land there without losing the
  distinction between its parts.
- **The supplement page repeats an `Ethnicity` box** alongside the complaint page's own race/ethnicity. Both are
  kept as separate fields (`descriptionEthnicity` and `statusEthnicity`) because the printed form asks for both
  and nothing here can tell which is meant to be authoritative.
- **Race, ethnicity, vehicle style and colour, offense level, speed detection, jailed status, release type,
  direction of travel and assignment are free text.** The printed form takes a code in each, but OKC's code sets
  are not published with it; inventing codes would be worse than a text box. Turning one into a coded box is an
  entry in `value-lists.ts`, a `get*Options` on the service, and a change of constructor in the schema.
- **`setTicketNumber` returns the form unchanged** — the citation number is assigned by the municipal court and
  arrives with the host's data.
- **Name collisions with the framework.** `SectionModel` already declares `name`, and `Entity` declares `id`, so a
  field definition cannot be called either. Hence `officerName`, `swornName`, `witnessName`, `ownerName` and the
  license section's `identifier`.

## Recipes

**Add a field**: schema `defineFields` → `IOKTrafficFormSchema` interface → section model → section component
(use `TextBox`/`NumberBox`/`SelectBox`/`YesNoBox`) → `IOKTrafficData` → the mapper's `extract`/`populate` pair →
a rule in `createRuleCollection` if needed.

**Add a section**: schema section + fields → `src/models/<page>/<name>-section.ts` → the page model
(`readonly xSection` + `getXSection()`) → `src/components/<page>/<name>-section.tsx` → render it in the page
component → an `extract`/`populate` pair in the mapper's per-page block.

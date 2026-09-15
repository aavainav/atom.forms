# `@forms/s438` — SC S438 Uniform Traffic Ticket

Catalog identity: **name `"S438 Citation Form"`, version `"1.0"`**. Sandbox route `sc/s438`, which the host owns. Module name `s438-citation-form`.
Form type `"citation"` (extends `CitationForm`).

The simplest of the citation packages: two page types, no value lists. Reach for this one as the template for
putting the violation selector on a form — it is where that pattern was worked out first.

## Structure

```
front-page   9 sections: header, violator, vehicle, owner, court, violation,
                         violation-location, arresting-officer, footer
             repeats: one front page per violation the citation is written for
notice-page  0 sections (static printed notice text)
```

**Every section but `violation` is `{ isShared: true }`.** The S438 prints one charge per ticket, so a stop
producing three charges produces three front pages, and the violator, vehicle, owner, court, location and officer
boxes read the same on all of them — a write to any of those fans out to every page. Only the violation section
differs. The violation *location* is shared: one stop happens in one place.

4 dropzones, all on the front page: violator (person), owner (person), vehicle, violation.

## Files

| Path | Contents |
| --- | --- |
| [src/module.ts](src/module.ts) | `S438CitationModule` and its exported `CATALOG_IDENTITY`. `configure` registers the catalog item with a `load()` that dynamically imports the model, schema, components and violations, registers the mapper and violations, and constructs `new S438FormSchema()` -- none of it runs until a host actually opens this form. |
| [src/bootstrapper.ts](src/bootstrapper.ts) · [src/options.ts](src/options.ts) · [src/index.ts](src/index.ts) | Wiring. `options.ts` is currently empty. |
| [src/models/s438-form-schema.ts](src/models/s438-form-schema.ts) | **The one file to read first.** The whole definition tree plus an inline `ruleCollection`. |
| [src/models/s438-form.ts](src/models/s438-form.ts) | `S438FormModel extends CitationForm`. |
| [src/models/front-page/](src/models/front-page/) | `front-page.ts` + one file per section + `dropzones/`. |
| [src/models/notice-page/notice-page.ts](src/models/notice-page/notice-page.ts) | Sectionless page model. |
| [src/components/](src/components/) | `s438-citation-form.tsx` (root) and `front-page/`+`notice-page/` mirroring the models tree. |
| [src/mapping/s438-data.ts](src/mapping/s438-data.ts) | `IS438Data` — flat, every field optional, plus `additionalViolations` for the charges beyond the first. `IS438ViolationData` is the per-page half. |
| [src/mapping/s438-mapper.ts](src/mapping/s438-mapper.ts) | `S438Mapper extends FormMapper<S438FormModel, IS438Data>`. `populate` is **async**, since the front page repeats and creating one means awaiting `initialize`. |
| [src/services/s438-citation.ts](src/services/s438-citation.ts) | `IS438CitationService` — four `apply*Dropzone` methods plus `applyViolations`. No value-list methods; this form has no option fields. |
| [src/violations.ts](src/violations.ts) · [data/](data/) · [src/generated/](src/generated/) | The `sc-s438:violation` list. |

## Notable specifics

- Rules live **inline in the schema** as a `RuleCollection` literal (unlike the other two forms, which have a
  separate `*-rules.ts` with a `createRuleCollection(schema)` factory). There are only three:
  required first/last name, and a max-length 5 zip. If the rule set grows, extract it to
  `src/models/s438-rules.ts` to match the other packages.
- **Form self-stamping.** `CitationForm.initialize()` chains `setDateOfViolation().setTicketNumber()`. Every
  `ICitationForm` setter returns `this` and threads its change back through the page collection via the private
  `setFrontPageValue(sectionDefinition, fieldDefinition, value, isEnabled)` helper — the same shape as
  `TR310FormModel.setCollisionValue`. A setter returning `void` here would have its work silently discarded, since
  the model is immutable.
  - `setDateOfViolation` stamps `MM/DD/YYYY` (module-level `formatDate`) and **disables** the box. Note this is not
    the `YYYY-MM-DD` that `DateRangeFieldRule` parses; the form has no date rule today, but adding one means
    changing the format too or it will silently skip validation.
  - `setTimeOfViolation` stamps the time and leaves it editable. It is **not** called from `initialize()`.
  - `setIssuedDate` / `setIssuedTime` return the form unchanged — the citation has no boxes for them distinct from
    the arrest date and time of violation.
- `setTicketNumber` holds a hard-coded `"20250000000000"` behind a `// TODO`; the citation cannot issue its own
  number and no ticket-number source is wired up yet.
- `VehicleSectionModel.make` is a `StringFieldModel` here (free text), so the vehicle dropzone applies the dropped
  make and year directly with no value-list resolution — contrast the other two forms.
- `IS438Data` keeps the first charge in its **flat** `violation*` fields and carries the rest in
  `additionalViolations`, so a record written before a citation could hold more than one charge round trips
  unchanged. `extract` reads the shared sections from the first page only; `populate` writes them onto **every**
  page, because a page it creates goes through `createPage` rather than the form controller and so is not seeded
  for it. Pages beyond the end of `additionalViolations` are left alone, not removed.

## The violation selector

The list is `sc-s438:violation`, generated from [data/violations.json](data/violations.json) — a **starter set**,
not an authoritative one: the SCDPS publishes no machine-readable code list with the S438, so the point values and
court-appearance flags need checking against the current Code. An agency serving its own list registers over the
id, which replaces this outright.

`S438CitationService.applyViolations` is what the selector calls. It:

1. finds the first front page with **no charge on it** — no section number and no description — and starts there,
   so picking again adds to the citation rather than rewriting it, while the first pick still fills the page the
   form opened with;
2. `await`s `controller.addPage` for each violation beyond that, which seeds the new page's shared sections;
3. writes each violation's statute, description, points and court-appearance answer into that page's violation
   section **and disables those boxes**, so a charge that came from the code list is not quietly typed over;
4. **carries the date and time of violation across from the first page**, leaving both editable. Those two sit
   inside the violation section rather than a shared one, so the shared-section copy does not move them, and one
   stop produces one date and time however many charges come out of it.

`getAppliedViolations` is the read side, and is what keeps a charge already on the citation ticked and locked in
the selector. It matches on the **violation section number**, which is where this citation prints the statute; a
violation carrying no statute of its own was written under its code. `applyViolationDropzone` locks the same boxes,
so a dragged violation is on the citation exactly as a chosen one is.

## Recipes

**Add a field**: `defineFields` block in the schema → `IS438FormSchema` interface → the section model
(`readonly x` definition + `getX()`) → the section component → `IS438Data` → the mapper's matching `extractX`/
`populateX` pair (adjacent in the file, keep them in step) → a rule in the schema's `ruleCollection` if needed.

**Add a section**: schema `DefinitionFactory.section` + `defineFields` → `src/models/front-page/<name>-section.ts` →
`FrontPageModel` (`readonly xSection` + `getXSection()`) → `src/components/front-page/<name>-section.tsx` → render it
in `front-page.tsx` → an `extract`/`populate` pair in the mapper.

**Add a dropzone**: subclass `PersonDropzone`/`VehicleDropzone` in `src/models/front-page/dropzones/`, register it in
`FrontPageModel.initialize()`, add an `apply*Dropzone` method to `S438CitationService`, and wrap the section
component in `<FDropzone>` in `front-page.tsx`.

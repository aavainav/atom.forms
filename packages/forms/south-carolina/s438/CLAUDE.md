# `@forms/s438` — SC S438 Uniform Traffic Ticket

Catalog identity: **name `"S438 Citation Form"`, version `"1.0"`**. Sandbox route `sc/s438`, which the host owns. Module name `s438-citation-form`.
Form type `"citation"` (extends `CitationForm`).

The simplest of the citation packages: three page types, no value lists. Reach for this one as the template for
putting the violation selector on a form — it is where that pattern was worked out first.

## Structure

```
front-page   9 sections: header, violator, vehicle, owner, court, violation,
                         violation-location, arresting-officer, footer
             repeats: one front page per violation the citation is written for
notice-page  0 sections (static printed notice text)
trial-page   10 sections: header (void, notes), violator, vehicle, owner, court, violation,
                          violation-location, arresting-officer (+ bail received), court-information, footer
             one per citation: the court's copy of the ticket
```

**The trial page holds its own copy of everything.** Its top half mirrors the front page's sections, but as separate
`trial-*` definitions, models, components and `trial*` data-contract fields -- nothing is copied across from the front
page, so the two can differ. It is not repeated per charge, and the issued lock does not touch it: the court fills in
its court-information block after the citation is issued. "Same as Original" is a checkbox only; it does not fill in
the charge convicted of.

**Every section but `violation` is `{ isShared: true }`.** The S438 prints one charge per ticket, so a stop
producing three charges produces three front pages, and the violator, vehicle, owner, court, location and officer
boxes read the same on all of them — a write to any of those fans out to every page. Only the violation section
differs. The violation *location* is shared: one stop happens in one place.

8 dropzones: violator (person), owner (person), vehicle and violation on the front page, and the same four on the
trial page. The trial page's violation dropzone does **not** lock the boxes it fills, unlike the front page's -- the
trial copy has no page to delete to take a charge off, so typing over it must stay possible.

## Files

| Path | Contents |
| --- | --- |
| [src/module.ts](src/module.ts) | `S438CitationModule` and its exported `CATALOG_IDENTITY`. `configure` registers the catalog item with a `load()` that dynamically imports the model, schema, components and violations, registers the mapper and violations, and constructs `new S438FormSchema()` -- none of it runs until a host actually opens this form. |
| [src/bootstrapper.ts](src/bootstrapper.ts) · [src/options.ts](src/options.ts) · [src/index.ts](src/index.ts) | Wiring. `options.ts` is currently empty. |
| [src/models/s438-form-schema.ts](src/models/s438-form-schema.ts) | **The one file to read first.** The whole definition tree plus an inline `ruleCollection`. |
| [src/models/s438-form.ts](src/models/s438-form.ts) | `S438FormModel extends CitationForm`. |
| [src/models/front-page/](src/models/front-page/) | `front-page.ts` + one file per section + `dropzones/`. |
| [src/models/notice-page/notice-page.ts](src/models/notice-page/notice-page.ts) | Sectionless page model. |
| [src/models/trial-page/](src/models/trial-page/) | `trial-page.ts` + one file per section + `dropzones/`. Class names are `Trial`-prefixed; file names mirror `front-page/`. |
| [src/components/](src/components/) | `s438-citation-form.tsx` (root) and `front-page/`, `notice-page/` and `trial-page/` mirroring the models tree. Both pages' sections use core's `FTextField`/`FNumberField`/`FCheckboxField` wrappers and size every box with a pixel `width` -- each row adds up to 588px, the 640px citation page less its padding and border. |
| [src/mapping/s438-data.ts](src/mapping/s438-data.ts) | `IS438Data` — flat, every field optional, plus `additionalViolations` for the charges beyond the first. `IS438ViolationData` is the per-page half. |
| [src/mapping/s438-mapper.ts](src/mapping/s438-mapper.ts) | `S438Mapper extends FormMapper<S438FormModel, IS438Data>`. `populate` is **async**, since the front page repeats and creating one means awaiting `initialize`. |
| [src/services/s438-citation.ts](src/services/s438-citation.ts) | `IS438CitationService` — four `apply*Dropzone` methods for the front page, four `applyTrial*Dropzone` for the trial page, plus `applyViolations`. No value-list methods; this form has no option fields. |
| [src/violations.ts](src/violations.ts) · [data/](data/) · [src/generated/](src/generated/) | The `sc-s438:violation` list. |

## Notable specifics

- **Rules live in [src/models/s438-rules.ts](src/models/s438-rules.ts)** (`createRuleCollection(schema)`, like the other
  forms), taken from the agency's business-rules sheet. One `createTicketRules` builds the rules for a copy of the
  ticket from its fields, and is called for the front page and again for the trial copy's own fields; the court's
  disposition rules are separate. Behaviours (CDL auto-set, the none boxes, Same as Driver) and pick-lists are
  still to do.
  - **[src/models/speeding-rule.ts](src/models/speeding-rule.ts)** is S438's own rule (core exports `Rule` and
    `RegisterRule` for this). `speedingStatutes` maps each speeding statute, as the violation list writes it, to how
    far over the limit it covers -- 56-5-1520(G)(1)-(4) in their bands, 56-5-1570(A) just over. The issue goes on the
    section number. The two speed boxes (`violationSpeed`/`violationSpeedLimit`, per charge) are required for any of
    those statutes, by an ordinary required rule gated on the same table. Matching is exact, so a statute typed
    unpadded (`56-5-1520(G)(1)`) is not recognised as speeding.
  - Comb. needs two other vehicle types (`RequiredSelectionRule.atLeast`), trial copy only like the other type rules.
  - Birth date is `notInFuture`; date of trial is `inFuture` (after today). On the trial copy the trial date is held to
    the future only until a disposition date is entered, since the court disposes of the case after the trial.
  - The front page does not draw race, sex or the vehicle types, so their rules apply to the trial copy only
    (`ITicketOptions`); a rule on a box that is never drawn could never be satisfied.
  - The violation section pattern checks only the statute's numbers up front (`xx-xx(x)-xxx(x)`, or `ORD.…`) and
    leaves the subsection suffix alone, since the violation list writes those every which way. A test holds every
    statute in the list to it.
  - "Case before" is required only once the court has entered a disposition date.
  - Dates are `mm/dd/yyyy` and times military `hhmm`, by pattern. `DateRangeFieldRule` reads `mm/dd/yyyy` as well as
    `YYYY-MM-DD`.
- **Form self-stamping.** `CitationForm.initialize()` chains `setDateOfViolation().setTimeOfViolation().setTicketNumber()`. Every
  `ICitationForm` setter returns `this` and threads its change back through the page collection via the private
  `setFrontPageValue(sectionDefinition, fieldDefinition, value, isEnabled)` helper — the same shape as
  `TR310FormModel.setCollisionValue`. A setter returning `void` here would have its work silently discarded, since
  the model is immutable.
  - `setDateOfViolation` stamps `MM/DD/YYYY` (module-level `formatDate`) and **disables** the box.
  - `setTimeOfViolation` stamps military `hhmm` (`formatTime`) and leaves it editable, matching the time rule. The base `initialize()` calls it, so a new form starts with it.
  - `setIssuedDate` / `setIssuedTime` return the form unchanged — the citation has no boxes for them distinct from
    the arrest date and time of violation.
- **The workflow is South Carolina's own.** `S438FormModel.workflow` is `citationWorkflow.with({ id: "sc-citation", locks })`:
  the transitions are the citation family's (one, `issue`), and only the lock differs. In SC an officer may correct an
  issued citation until the court takes it, so issuing closes just what the citation *charges* -- the violation section,
  the violation-location section, and the set of front pages (so no page can be added or removed, which is how a
  violation would otherwise be moved). Everything else stays editable and the form stays in `editable` mode. "The court
  has taken it" is the host's to say, by loading the record `viewable`. The front page's violation dropzone gate asks
  `binding.isSectionLocked(frontPage.violationSection)` rather than the mode, and the same lock is applied again when
  an issued record is loaded. Georgia and Oklahoma keep the family's whole-form lock.
- `setTicketNumber` returns the form unchanged -- the citation cannot issue its own number, so it arrives with the data
  a host loads, through the defaults for a new form.
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
`populateX` pair (adjacent in the file, keep them in step) → a rule in `s438-rules.ts` if needed (for a top-half field,
in both the front page's and the trial copy's mapping passed to `createTicketRules`).

**Add a section**: schema `DefinitionFactory.section` + `defineFields` → `src/models/front-page/<name>-section.ts` →
`FrontPageModel` (`readonly xSection` + `getXSection()`) → `src/components/front-page/<name>-section.tsx` → render it
in `front-page.tsx` → an `extract`/`populate` pair in the mapper.

**Add a dropzone**: subclass `PersonDropzone`/`VehicleDropzone` in `src/models/front-page/dropzones/`, register it in
`FrontPageModel.initialize()`, add an `apply*Dropzone` method to `S438CitationService`, and wrap the section
component in `<FDropzone>` in `front-page.tsx`.

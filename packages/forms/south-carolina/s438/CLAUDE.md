# `@forms/s438` — SC S438 Uniform Traffic Ticket

Catalog identity: **name `"S438 Citation Form"`, version `"1.0"`**. Route `sc/s438`. Module name `s438-citation-form`.
Form type `"citation"` (extends `CitationForm`). Form factory version string `"v2025"`.

The **simplest** of the three form packages: two pages, both fixed (no repeating pages), no value lists, a synchronous
mapper. Reach for this one as the template for a new fixed-page form.

## Structure

```
front-page   9 sections: header, violator, vehicle, owner, court, violation,
                         violation-location, arresting-officer, footer
notice-page  0 sections (static printed notice text)
```

3 dropzones, all on the front page: violator (person), owner (person), vehicle.

## Files

| Path | Contents |
| --- | --- |
| [src/module.ts](src/module.ts) | `S438CitationModule`. Registers the form and its route with the report viewer, registers the mapper, constructs `new S438FormSchema()`, registers the catalog item. |
| [src/form-factory.ts](src/form-factory.ts) | `S438FormFactory` — `createForm()` and `getPageTypes()` (`front-page`, `notice-page`). |
| [src/bootstrapper.ts](src/bootstrapper.ts) · [src/options.ts](src/options.ts) · [src/index.ts](src/index.ts) | Wiring. `options.ts` is currently empty. |
| [src/models/s438-form-schema.ts](src/models/s438-form-schema.ts) | **The one file to read first.** The whole definition tree plus an inline `ruleCollection`. |
| [src/models/s438-form.ts](src/models/s438-form.ts) | `S438FormModel extends CitationForm`. |
| [src/models/front-page/](src/models/front-page/) | `front-page.ts` + one file per section + `dropzones/`. |
| [src/models/notice-page/notice-page.ts](src/models/notice-page/notice-page.ts) | Sectionless page model. |
| [src/components/](src/components/) | `s438-citation-form.tsx` (root), `s438-citation-form-loader.tsx` (route), and `front-page/`+`notice-page/` mirroring the models tree. |
| [src/mapping/s438-data.ts](src/mapping/s438-data.ts) | `IS438Data` — a **flat** contract, every field optional. |
| [src/mapping/s438-mapper.ts](src/mapping/s438-mapper.ts) | `S438Mapper extends FormMapper<S438FormModel, IS438Data>`. `populate` is **synchronous** (returns the form, not a promise) because no page repeats. |
| [src/services/s438-citation.ts](src/services/s438-citation.ts) | `IS438CitationService` — the three `apply*Dropzone` methods. No value-list methods; this form has no option fields. |

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
- `IS438Data` is completely flat: no nested arrays, so `extract`/`populate` operate on the first (only) front page.

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

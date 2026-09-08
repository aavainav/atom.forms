# `@forms/ok-parking` — OKC Parking Violation

Catalog identity: **name `"OKC Parking Violation"`, version `"1.0"`**. Route `ok/parking`. Module name
`ok-parking-form`. Form type `"citation"` (extends `CitationForm`). Form factory version string `"v2026"`.

Oklahoma City Municipal Court parking violation. Three pages, all fixed, a synchronous mapper, one owned value
list. Sits between [s438](../../south-carolina/s438/) and
[public-contact-or-warning](../../south-carolina/public-contact-or-warning/) in complexity.

## Structure

```
citation-page   5 sections: violation, payment, court, vehicle, officer        (the copy left on the vehicle)
                repeats: one citation page per violation the ticket is written for
complaint-page  3 sections: complaint, certification, warrant                  (counselor and clerk endorsements)
detail-page     4 sections: record, registered-owner, vehicle-detail, notes    (owner and vehicle description)
```

**`violation` and `payment` are per-page; `court`, `vehicle` and `officer` are `{ isShared: true }`.** The fine is
per violation, so it travels with the charge rather than with the vehicle it was left on.

3 dropzones: `CitationPageVehicleDropzone` (make only), `CitationPageViolationDropzone`,
`DetailPageOwnerDropzone` (registered owner).

## The violation picker

The list is `ok-parking:violation`, written **inline** in [src/violations.ts](src/violations.ts) — Oklahoma City
publishes no machine-readable parking code list, so the codes and scheduled fines need checking against the current
municipal code.

`OKParkingService.applyViolations` writes the code and description into the violation block and the fine into the
**payment** block beneath it; a violation carrying no fine leaves the amount for the clerk. The date, time and
location are carried across from the first page, since they sit in the violation section rather than a shared one
and one ticket run produces one of each.

## Files

| Path | Contents |
| --- | --- |
| [src/models/parking-form-schema.ts](src/models/parking-form-schema.ts) | **Read first.** The whole definition tree; `ruleCollection` delegates to `createRuleCollection(this)`. |
| [src/models/parking-rules.ts](src/models/parking-rules.ts) | `createRuleCollection(schema)`, grouped by section. |
| [src/models/parking-form.ts](src/models/parking-form.ts) | `OKParkingFormModel extends CitationForm`. Page accessors and the date/time stamping. |
| [src/models/<page>/](src/models/) | Page model + one file per section + `dropzones/`. |
| [src/components/](src/components/) | Root form, route loader, and one `.tsx` per section mirroring the models tree. |
| [src/mapping/parking-data.ts](src/mapping/parking-data.ts) | `IOKParkingData` — **flat**, 44 optional fields, alphabetical. Option fields typed `IOptionValue`. |
| [src/mapping/parking-mapper.ts](src/mapping/parking-mapper.ts) | `populate` is **synchronous**; one `extract`/`populate` pair per section, adjacent. |
| [src/services/parking.ts](src/services/parking.ts) | `IOKParkingService` — 2 `apply*Dropzone`, 3 `get*Options`, `resolveVehicleDropzone`. |
| [src/value-lists.ts](src/value-lists.ts) · [data/](data/) · [src/generated/](src/generated/) | `ok-parking:county` and its source data. |

## Value lists

| Id | Source |
| --- | --- |
| `ok-parking:county` | generated from `data/counties.json` — Oklahoma's 77 counties |

Also drawn from `@forms/value-lists`: `ValueListId.state` (owner), `ValueListId.vehicleMake`.

`yarn generate` regenerates `src/generated/`. Never statically import from it.

## Decisions worth knowing before you change something

- **County codes are alphabetical positions 1–77**, which is how Oklahoma numbers counties on a license plate.
  If OKC's own county code set differs, edit `data/counties.json` and run `yarn generate` — nothing that reads the
  list moves.
- **Dates are stored `YYYY-MM-DD`**, not the `MM/DD/YYYY` the form prints. That is the only order
  `DateRangeFieldRule` parses, and an unparseable value silently skips date validation. A host mapping a source
  that uses another order must convert before its data reaches the contract.
- **The vehicle is split across two pages** — plate/make/meter on the citation page, VIN/year/type/colour/model on
  the detail page — because the printed form splits it. Consequences:
  - the vehicle dropzone lives on the **citation page** and maps the **make only**; a dropzone writes onto the one
    section it was built from, so the model and year on the detail page are not drop targets;
  - the detail page's **model is free text**, not an option field. The vehicle model list hangs off the make, and
    `setOptionWithDependents` needs both fields on one section to clear the child when the parent changes.
- **`vehicleLicenseNumber` is required unless `vehicleNoLicensePlate` is checked**, and those two fields are on
  different pages. This works because a `FieldValueCondition` resolves a field from another page through the form
  (`RuleContext.getField` falls back to the first instance on the form). It is the clearest example of a
  cross-page condition in the repo.
- **`setTicketNumber` returns the form unchanged** — the citation number is assigned by the municipal court and
  arrives with the host's data, like `TR310FormModel.setCrashNumber`.
- **Beat, tribe, void reason, vehicle type and colour are free text.** The printed form takes a code in each, but
  OKC's code sets for them are not published with the form; inventing codes would be worse than a text box. Each
  becomes an option field the day the list arrives: an entry in `value-lists.ts`, a `get*Options` on the service,
  and a change of constructor in the schema.
- **The "Pictures" area on page 3 is not modeled.** It holds attachments, not values.

## Recipes

**Add a field**: schema `defineFields` → `IOKParkingFormSchema` interface → section model → section component →
`IOKParkingData` → the mapper's `extract`/`populate` pair → a rule in `createRuleCollection` if needed.

**Add a value list**: JSON in `data/` → entry in `data/lists.json` → `yarn generate` → id in
`OKParkingValueListId` → dynamic-`load` definition in `okParkingValueLists` → `get*Options` on the service → use
`FFieldSelect` with `cacheKey`, `controller` and a `useCallback`-wrapped loader.

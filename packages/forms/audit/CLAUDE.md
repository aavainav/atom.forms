# `@forms/audit`

Records what happens to a form: opened, edited, status changed, validated, printed, saved. Owns the record types, the controller
that produces them, the service a host subscribes to, and the hook that connects the two. Depends on
`@forms/core`.

Module dependencies: none.

**This package sits below whatever renders a form, and reaches nothing upward.** It registers nothing with the
report viewer; `@forms/report-viewer` calls `useAuditRecorder` itself. There is no bootstrapper — a host
gets auditing by rendering a report. A form package never depends on it.

**Records name fields, never values.** A form is full of names, dates of birth and licence numbers. A record carries
the form's identity, the time, and the *paths* of what changed, so a host that wants a value has the form to read it
from. Carrying values would mean changing `getChangedPaths` and the record types, deliberately.

## What it records

| `kind` | Raised when | Detected from |
| --- | --- | --- |
| `form-opened` | A form is shown, freshly loaded or swapped in. Carries the form's `status`, and `isReadOnly` once it passes through `useAuditRecorder` | `start()`, and the manager announcing a new form |
| `fields-edited` | Edits settle for `editQuietPeriod` (1.5s) | Form controller changes, diffed |
| `status-changed` | The form's `status` changes while it is open, as `{ from, to }` | Form controller changes, comparing `status` |
| `validated` | The form is validated | Rules controller changing |
| `print-started` / `print-ended` | The form enters and leaves its print layout | Print controller's `state` |
| `saved` / `save-failed` | A save finishes | **Pushed** by the caller; see below |

Every record is `{ at, form: { id, name, version }, kind, … }` (`AuditRecord`).

## Files

| Path | Contents |
| --- | --- |
| [src/controllers/audit-controller.ts](src/controllers/audit-controller.ts) | **The heart.** `IAuditController`, `AuditController`, `getAuditController`, `editQuietPeriod`. |
| [src/models/audit-record.ts](src/models/audit-record.ts) | `AuditRecord` and its pieces. `IAuditRecordMap` is the one place a kind is declared; the rest is derived from it. |
| [src/utils/changed-paths.ts](src/utils/changed-paths.ts) | `getChangedPaths(before, after)`, the diff over two contract extracts. |
| [src/services/audit.ts](src/services/audit.ts) | `IAuditService` (`onRecord`, `record`) and the `AuditService` singleton. Event only, like the notification service. |
| [src/hooks/use-audit-recorder.ts](src/hooks/use-audit-recorder.ts) | `useAuditRecorder`: forwards the controller's records to the service, adding `isReadOnly` to `form-opened`. |
| [src/module.ts](src/module.ts) | `AuditModule`. Registers the service and nothing else. |

## How it works

`AuditController` is `@RegisterController("audit", { eager: true })`, so `ControllerManager.loadForm` creates it
during render, after the form controller. `start()` opens the form and subscribes to the manager's
`onControllerChanged`, then reacts by controller `key`.

- **Edits** are found by diffing `form.mapper.extract(form)` against a **baseline** taken when the form was opened or
  the last edits were recorded. Each form change resets a quiet-period timer; when it fires, `getChangedPaths` names
  the paths whose values differ, and the baseline moves up. Paths are the form's own data-contract paths
  (`violatorSex`, `additionalViolations[1].violationDescription`). An option box's `{ value, description }` pair is one
  field, an array of plain values is one value, and an array of records compares by position.
- **Order is causal.** Validating, printing and saving all `flush()` first, so the edits come before what followed them.
- **Records raised while nothing listens are held** for the next listener, the latest `maxPendingRecords` (100). The
  controller starts during render and `useAuditRecorder` subscribes in an effect, so `form-opened` is always raised
  too early to be heard live. A host that reuses one manager remounts the hook for each form, and a form loaded in
  between is heard by the next one.
- **A different form is announced by the manager.** `loadForm` raises `onControllerChanged` for the form controller
  when the form is new to it, and `setForm` raises it on the controller. The audit sees the id change, flushes the old
  form's edits under the old identity, and opens the new one from the state it arrived in. Without the announcement
  it would take the first edit to the new form as its baseline and swallow it.

## Getting the records out

`useAuditRecorder` subscribes to the controller in an effect and calls `IAuditService.record`. A host subscribes to the
service once, at startup, before any form renders:

```ts
services.get<IAuditService>(IAuditService).onRecord(record => send(record));
```

`IAuditService`, `AuditRecord` and `IAuditFormIdentity` are re-exported from `@forms/report-viewer`, so a host needs
only that package. Whatever is still waiting out the quiet period is recorded on unmount and on `pagehide`.

To watch it live, open the sandbox's `/demo/audit` (`yarn dev-forms`), which lists each record beside a form.

## Saves are pushed, not inferred

The save flow lives in the report viewer, above this package, and a dirty→clean transition is ambiguous: starting a
new form calls `clean()` too. So the report viewer's `SaveOption` and the save path of `NewFormOption` call
`getAuditController(controllers).recordSaved()` / `recordSaveFailed()`. **Anything else that saves must do the same.**

## Gotchas

- **Adding a kind is one entry in `IAuditRecordMap`.** The union and `AuditRecordDetailKind` follow from it, and the
  sandbox's `kindColours` stops compiling until it names the new kind.
- **`isReadOnly` is added by `useAuditRecorder`, not the controller**, which cannot tell whether a form is read-only.
  A record read straight off the controller carries `status` but no `isReadOnly`.
- **`status-changed` only fires for a change made through the form controller.** A status set on the model before it
  is loaded is part of what `form-opened` reports.
- **A form with no mapper has its edits unrecorded**: there is nothing to diff. Every shipped form has one.
- **A hard crash loses up to `editQuietPeriod` of edits.** Unmount and `pagehide` flush; nothing else can.
- **A save the host performs itself is not audited.** On the plain `<ReportViewer />` path a host has no controller to
  call `recordSaved` on, so only the report viewer's own save paths produce `saved` / `save-failed`.
- **Printing begins twice per print** (the second adds the measured scale), so only the change between not printing and
  printing is recorded.
- **The controller registers when its module loads.** `src/index.ts` exports it so importing the package is enough;
  giving this package `"sideEffects": false` would silently break that.
- **`getAuditController` throws if no form is loaded**, because `start()` reads the form controller.
- **Only one component should call `useAuditRecorder` per manager**, or every record is forwarded once per call.

## Tests

`yarn test` runs under `jsdom`, since the controller extends core's `Controller` and so loads the barrel. The
controller tests use a real `ControllerManager` with **stub forms** ([test/fixtures/stub-form.ts](test/fixtures/stub-form.ts)):
the audit reads only a form's identity and what its mapper extracts. Timers are faked, and the hook's test mounts a
small harness component that calls it, with `react-dom` and `act`, since no testing library is installed.

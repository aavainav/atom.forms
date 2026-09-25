# `@forms/audit`

Records what happens to a form: opened, edited, status changed, moved along its workflow, validated, printed, saved. Owns the record types, the controller
that produces them and holds the history of the report, the service a host subscribes to, and the hook that
connects the two. Depends on `@forms/core`.

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
| `form-opened` | A form is shown, freshly loaded or swapped in, or shown again when the browser restores its page from the cache. Carries the form's `status` and `mode` | `start()`, the manager announcing a new form, and the manager's `onOpened` |
| `fields-edited` | Edits settle for `editQuietPeriod` (1.5s) | Form controller changes, diffed |
| `dropped` | A drag-and-drop populated fields, as `{ type, fields }` | An `update()` naming what it was, comparing before/after -- see below. Declared by core |
| `form-closed` | A form stops being shown, as `{ status, mode, isDirty }` -- `isDirty` says whether it still held changes that were never saved. Once for each form opened | The manager closing (the viewer unmounting, or `pagehide`), or another form replacing it in the same manager; see "Closing" below |
| `page-focused` | A different page comes into view, in any mode: `{ page, pageOrdinal }`. The first page shown is not recorded, since `form-opened` says it, and neither is a page returning after a print, nor the first page of another form loaded into the same manager | Reported by core's `NavigationController` through the manager's `onActivity` |
| `page-added` / `page-removed` | A page was added to, or removed from, a set of pages: `{ page, pageOrdinal, fields }`, the page definition's name and where the page sits, counting from zero | Same as `dropped`, from `FormController.addPage` / `removePage`. Declared by core |
| `violations-added` | Violations were added from the panel, as `{ codes, fields }` | Same as `dropped`. Declared by `@forms/violations` |
| `status-changed` | The form's `status` changes while it is open, as `{ from, to }`, **and no transition accounts for it** | Form controller changes, comparing `status` |
| `workflow-transition` | The form makes a transition of its workflow: `{ transition, from, to, note? }` | Form controller changes, comparing `form.history` |
| `validated` | The form is validated | Rules controller changing |
| `print-started` / `print-ended` | The form enters and leaves its print layout | Print controller's `state` |
| `saved` / `save-failed` | A save finishes | **Pushed** by the caller; see below |
| `report-data-viewed` / `report-data-copied` | The report data dialog opens or moves to another tab, or a tab of it is copied: `{ tab }`, the id of the tab (`data`, `audit`, `comments`, `workflow` or `all`), never what it holds. A copy the browser refuses is not recorded | **Pushed** by the report viewer's report data option, through `recordDataViewed(tab)` / `recordDataCopied(tab)` |
| `comment-added` / `comment-resolved` / `comment-reopened` | A reviewer comments on the report, or a comment is resolved or reopened: `{ commentId, target }`, the comment's id and where it is, never what it says | Reported by `@forms/review`, through the manager's `onActivity` |
| Whatever a package reports | A controller calls `emitActivity({ kind, ... })` | The manager's `onActivity`; the package declares the kind by merging into core's `IControllerActivityMap` |

Every record is `{ at, by?, form: { id, name, revision, version }, id, kind, … }` (`AuditRecord`). `id` is a uuid stamped
when the record is raised, so a host handed one twice can tell. `by` is the `IActor` the manager was told is using
the report (`manager.setUser`), and is absent when the host did not say. It is read when a record is raised, so the
manager is told **before the form is loaded** for `form-opened`, which is raised as the load creates this controller,
to carry it. `form.revision` is whatever the report's own
revision was at that moment -- it moves independently of `id`, so it is refreshed on every observed change, not just
when a different form replaces the watched one.

## Files

| Path | Contents |
| --- | --- |
| [src/controllers/audit-controller.ts](src/controllers/audit-controller.ts) | **The heart.** `IAuditController`, `AuditController`, `getAuditController`, `editQuietPeriod`. |
| [src/models/audit-record.ts](src/models/audit-record.ts) | `AuditRecord` and its pieces. `IAuditRecordMap` is the one place a kind is declared; the rest is derived from it. |
| [src/utils/changed-paths.ts](src/utils/changed-paths.ts) | `getChangedPaths(before, after)`, the diff over two contract extracts. |
| [src/services/audit.ts](src/services/audit.ts) | `IAuditService` (`onRecord`, `record`) and the `AuditService` singleton. Event only, like the notification service. |
| [src/hooks/use-audit-recorder.ts](src/hooks/use-audit-recorder.ts) | `useAuditRecorder`: forwards the controller's records to the service, unchanged. |
| [src/module.ts](src/module.ts) | `AuditModule`. Registers the service and nothing else. |

## How it works

`AuditController` is `@RegisterController("audit", { eager: true })`, so `ControllerManager.loadForm` creates it
during render, after the form controller. `start()` opens the form and subscribes to the manager's
`onControllerChanged`, then reacts by controller `key`.

- **Edits** are found by diffing `form.mapper.extract(form)` against a **baseline** taken when the form was opened or
  the last edits were recorded. Each form change resets a quiet-period timer; when it fires, `getChangedPaths` names
  the paths whose values differ, and the baseline moves up. Paths are the form's own data-contract paths
  (`violatorSex`, `additionalViolations[1].violationDescription`). An option box's `{ value, description }` pair is one
  field, an array of plain values is one value, and an array of records compares by position -- unless its length
  changed, when a record was added or removed and which of the others moved cannot be told from an edit, so only the
  positions past the shorter side are reported (`list[2]`, not the records that shifted).
- **Order is causal.** Validating, printing and saving all `flush()` first, so the edits come before what followed them.
- **Records raised while nothing listens are held** for the next listener, the latest `maxPendingRecords` (100). The
  controller starts during render and `useAuditRecorder` subscribes in an effect, so `form-opened` is always raised
  too early to be heard live. A host that reuses one manager remounts the hook for each form, and a form loaded in
  between is heard by the next one.
- **A different form is announced by the manager.** `loadForm` raises `onControllerChanged` for the form controller
  when the form is new to it, and `setForm` raises it on the controller. The audit sees the id change, flushes the old
  form's edits under the old identity, and opens the new one from the state it arrived in. Without the announcement
  it would take the first edit to the new form as its baseline and swallow it.
- **Everything a package reports arrives through one channel, the manager's `onActivity`**, and the audit has no code of
  its own per kind: `IAuditRecordMap` extends core's `IControllerActivityMap` and `IFormActivityMap`, so it takes on
  every kind a package declares by merging into them. It flushes pending edits, stamps `at`, `by`, `form` and `id`, and
  appends. Two ways in, one handler (`observeActivity`):
  - **A controller reports something itself**, with core's protected `emitActivity` (`comment-added` and the rest from
    `@forms/review`). The record is the activity as reported.
  - **An update names what it was**, with `reason` on `update()` -- a dropzone's `onDrop` passes `dropped`, a
    violations service's `apply` passes `violations-added`. The manager relays it with the form the update produced,
    which survives the form controller itself being replaced (`onControllerChanged` alone would not). It is one atomic
    change, not a burst to coalesce, so it skips the quiet period: the audit diffs the form against its baseline and
    raises the record now, with `fields` added, and `fields-edited` finds nothing left to report for it. An update with
    no `reason` sends nothing here; it is found through `onControllerChanged` like any edit.

## Getting the records out

`useAuditRecorder` attaches to the controller's manager in an effect and calls `IAuditService.record`. A host subscribes to the
service once, at startup, before any form renders:

```ts
services.get<IAuditService>(IAuditService).onRecord(record => send(record));
```

`IAuditService`, `AuditRecord` and `IAuditFormIdentity` are re-exported from `@forms/report-viewer`, so a host needs
only that package. Whatever is still waiting out the quiet period is recorded when the viewer goes and on `pagehide`,
followed by the form's `form-closed`.

## Closing

`recordClosed()` flushes pending edits and then raises `form-closed`, **once for each form opened** (`open` clears the
flag), so a `pagehide` followed by an unmount records one close. Two things call it: the controller itself when its
manager closes, and `observeForm` when a different form replaces the watched one -- recorded under the *old* form's
identity, just before the new form's `form-opened`.

The manager closes when the viewer really goes, or on `pagehide`; core's `useFormController` holds it while mounted
(see `retain`, `release`, `close`, `reopen` and `attach` in [`@forms/core`](../core/)). The controller subscribes to
`onClosed` in `start()`, so the close is raised while the recorder and the writer are still attached, and they let go
only when the viewer really goes. That is why they attach to the manager rather than tear down with their component:
React's development `StrictMode` (which `@forms/workbench` uses) sets an effect up, tears it down and sets it up again
at once, and a close raised from a teardown would log a fake `form-closed` after every `form-opened`. The manager waits
a microtask before it takes a release for the end, and `attach` ignores a key it already holds, so the remount changes
nothing. `useAuditWriter` in `@forms/report-viewer` is attached the same way, and needs no particular order among the
hooks.

They last as long as the manager, not as long as the component that called them, and **`pagehide` does not detach
them**: a page the browser restores from its back/forward cache is not mounted again, so `pageshow` reopens the manager
instead, and the controller (subscribed to `onOpened`) records a fresh `form-opened` for the same form. The history
that was loaded for the report stays, and the next close is recorded again. If a different form was opened in between,
nothing is added.

To watch it live, open the sandbox's `/demo/audit` (`yarn dev-forms`), which lists each record beside a form.

## The history: loading it back, and getting it out whole

The stream above hands each record over and forgets it. The controller **also keeps them**, so a report's history can
be carried from one session to the next:

- `session` is every record raised since the controller started, for whichever form -- what is written back to the
  host. `history` is what is shown and exported: the records `load`ed for the report, then the session's records for
  the form now on screen. Each is the same array until a record is added, so either can be a snapshot; the controller
  raises `onChanged` when a record is added or history is loaded.
- `load(records)` takes the history the host held. The report viewer calls it with what the host's `read()` returned
  as `audit`, and again for a new form, since a new form is a new report. A different form replacing the watched one
  drops what was loaded, but leaves the old form's records in the session, so a write in flight still finds them.

The report viewer writes the session back through the data manager's `writeAudit`, **only the records not yet given**,
so the host is appended to. A host **merges by `id`** and never overwrites what it holds with what arrives: the history
is assembled on the client, and the ids exist so that taking a record twice is harmless. The whole history is also in
the bundle the viewer can hand over (`getBundle`, `writeBundle`). None of this changes the stream.

## Transitions are inferred, from the form's history

A form's `history` only grows, so on each change to the form the controller takes what is past the length it had and
raises a `workflow-transition` for each entry -- in order, after the edits that came before them. That is inferred
rather than pushed like a save, because the model itself says a transition happened; nothing about it is ambiguous.
The record names the transition by its id and carries both statuses and the `note`, and is attributed to the
controller's user like every other record.

**One happening is one record.** A transition changes the status, so the controller works out the status the entries
account for -- the last one's `to` -- and raises `status-changed` only if the form's status is something else. A status
set on the model directly still records as `status-changed`. A form that arrives with a history (a loaded report)
records none of it, since it only compares what came after it was opened.

## Saves are pushed, not inferred

The save flow lives in the report viewer, above this package, and a dirty→clean transition is ambiguous: starting a
new form calls `clean()` too. So the report viewer's `WorkflowActions` (its Save button) and the save path of
`NewFormOption` call `getAuditController(controllers).recordSaved()` / `recordSaveFailed()`. **Anything else that
saves must do the same.** Call `recordSaved` **after** the form controller holds the saved form: a record's
`form.revision` is read off the form the audit is watching, so recording first would stamp the save with the revision
from before it.

## Gotchas

- **Adding a kind is one entry in a map.** In `IAuditRecordMap` for one this package detects itself, or in core's
  `IControllerActivityMap` / `IFormActivityMap` (by declaration merging, from the package that reports it) for one a
  package reports. The union and `AuditRecordDetailKind` follow from it, and the sandbox's `kindColours` stops
  compiling until it names the new kind.
- **One action can raise several records, on purpose.** Choosing several violations records a `page-added` for each
  extra page, then one `violations-added`. Each is true and each is kept: the log is meant to hold every detail, not
  a summary of what happened.
- **`mode` is stamped by the controller itself**, straight off `form.mode`, the same way `status` is -- unlike the
  old `isReadOnly` field this replaced, which only the host knew and had to be added downstream by the recorder.
- **`status-changed` and `workflow-transition` only fire for a change made through the form controller.** A status set on the model before it
  is loaded is part of what `form-opened` reports.
- **A form with no mapper has its edits unrecorded**: there is nothing to diff. Every shipped form has one.
- **A hard crash loses up to `editQuietPeriod` of edits.** Unmount and `pagehide` flush; nothing else can.
- **`pagehide` records the close whether or not the page comes back.** A tab restored from the browser's
  back/forward cache records a fresh `form-opened`, so its log reads opened, closed, opened -- the close is real, and the
  restore is a second opening.
- **A manager that is let go and then held again does not re-attach the recorder or the writer** unless their effects
  run again, and the audit records no second `form-opened` or `form-closed` for it.
- **A save the host performs itself is not audited.** On the plain `<ReportViewer />` path a host has no controller to
  call `recordSaved` on, so only the report viewer's own save paths produce `saved` / `save-failed`.
- **Printing begins twice per print** (the second adds the measured scale), so only the change between not printing and
  printing is recorded.
- **The controller registers when its module loads.** `src/index.ts` exports it so importing the package is enough;
  giving this package `"sideEffects": false` would silently break that.
- **`getAuditController` throws if no form is loaded**, because `start()` reads the form controller.
- **`useAuditRecorder` attaches under a fixed key**, so calling it more than once for a manager forwards each record once.
- **`by` is only as good as what the host says.** The viewer stamps it from `settings.user` on the client, so a host that
  needs it trusted must check it on the way in.

## Tests

`yarn test` runs under `jsdom`, since the controller extends core's `Controller` and so loads the barrel. The
controller tests use a real `ControllerManager` with **stub forms** ([test/fixtures/stub-form.ts](test/fixtures/stub-form.ts)):
the audit reads only a form's identity, its status, its `history` and what its mapper extracts. Timers are faked, and the hook's test mounts a
small harness component that calls it, with `react-dom` and `act`, since no testing library is installed.

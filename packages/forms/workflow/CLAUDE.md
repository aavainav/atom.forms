# `@forms/workflow`

Interprets a form's `workflow`: which transitions it can make now, and what making one changes. Depends on
`@forms/core` alone.

## Why this package exists

Workflow used to be split unevenly: `FormModel` (in core) carried the *data* — `workflow?: IWorkflow` — but also the
*behavior* that interpreted it (`getTransitions`, `transition`, `restoreWorkflow`, and the private `applyLocks`), and
`CitationForm`/`CrashForm`/`WarningForm` assigned a workflow by **family**, so a form got one just by extending the
right base class. Both of those seams caused real trouble: the behavior bloated `FormModel` with logic that only
ever mattered to forms that had a workflow at all, and tying a workflow to a form's *type* meant a family class like
`WarningForm` existed almost entirely to hand out a workflow, with barely any behavioral contract of its own.

This package is the fix for the first seam. `@forms/core` keeps only the **model**: `IWorkflow`, `IWorkflowTransition`,
`defineWorkflow`, the family presets (`citationWorkflow`, `crashWorkflow`, `warningWorkflow`), and the generic,
workflow-agnostic primitives a workflow's `locks` call into (`setStatus`, `setMode`, `lockSection`, `lockPageSet`).
Everything that *reads* a workflow to decide what a form can do now, or that applies one, lives here instead, behind
one service. The fix for the second seam is a convention, not code: a concrete form assigns its own `workflow`
directly (see `packages/forms/CLAUDE.md`'s "Conventions that hold everywhere") rather than inheriting one.

## The whole API

```ts
const service = services.get<IWorkflowService>(IWorkflowService); // or `new WorkflowService()` — it has no dependencies of its own

service.getTransitions(form);                                   // Array<IAvailableTransition> the form can make now
service.canTransition(form, "issue");                            // boolean
service.transition(form, "issue", by, { issues, openComments });// the form it leaves, or throws
service.restoreWorkflow(form, status, stamp);                    // the form with a loaded record's status/history/lock restored
```

Every method takes the form as its first argument rather than being called on it — `form.transition(...)` became
`workflowService.transition(form, ...)`. All four are pure: none of them save anything, none of them know about
validation beyond being handed an already-computed `RuleIssueCollection`, and `transition`/`restoreWorkflow` return
a *new* form rather than mutating the one they are given, same as every other `FormModel` setter.

## Files

| Path | Contents |
| --- | --- |
| [src/services/workflow.ts](src/services/workflow.ts) | `IWorkflowService`/`WorkflowService`, the whole package. |
| [src/module.ts](src/module.ts) | `WorkflowModule` — registers the service. No controller: there is no per-form state to track, since every method is a pure function of the form it is given. |

## `transition` — what moved here from `FormModel`

In order: the transition has to exist on the form's workflow; the form has to be in a `from` status and the right
`mode`; the validation result it is handed must hold no error; and any guard the transition names must be
satisfied (`"hasOpenComments"` needs at least one open comment, `"noOpenComments"` needs none). Each throws with a
specific message on failure — the same messages `FormModel.transition` used to throw, since nothing about the rules
themselves changed, only where they live. Once made, the transition's `effect` runs (if it has one), the status
changes, an `IWorkflowEntry` is appended to `history`, and the lock the new status carries is applied — the same
`applyLocks` step `restoreWorkflow` ends with, now a private method here instead of on `FormModel`.

## `restoreWorkflow` — the "two-step load"

`FormModel.populate()` used to call this itself, restoring a loaded record's status and workflow history and
applying that status's lock in the same call. It can't do that anymore — `populate` only knows how to run a
mapper — so `restoreWorkflow` is now a second, explicit step whoever loads a record takes after `populate`
resolves:

```ts
form = await form.populate(result);
form = workflowService.restoreWorkflow(form, result.status, result.workflow);
```

This is exactly what `ReportViewerService.loadForm` does (see `@forms/report-viewer`'s `services/report-viewer.ts`),
and what every form package's own workflow tests do when they check that a loaded record comes back locked. Calling
it is safe for a form with no workflow at all: it still restores `status` (which `FPageCollection`'s watermark reads
regardless of whether a workflow exists), but applies no lock, since there is none to apply. Skipping this step
after `populate` is the one thing to get wrong — a loaded record would otherwise sit in its stored status but
without the lock that status is supposed to carry.

## Who reaches this package, and why

- **`@forms/report-viewer`** is the real consumer: `WorkflowActions` (its own package, not `@forms/core`'s
  presentational `FWorkflowActions`) calls `getTransitions` to drive the workflow buttons,
  `ReportViewerService.transition` calls `transition` to make one (and saves it), and `ReportViewerService.loadForm`
  calls `restoreWorkflow` after every populate.
- **Every citation/crash/warning form package** depends on it too, but only in its own `test/models/*-workflow.test.ts`
  — exercising `citationWorkflow`/`crashWorkflow`/`warningWorkflow` (or a jurisdiction's `.with()` of one) through the
  real service is more honest than each test file reimplementing transition logic to check its own workflow. No
  form package's `src/` imports this package; a form only declares *which* workflow it carries.

## Gotchas

- `WorkflowService` has no injected dependencies, so tests construct it directly (`new WorkflowService()`) rather
  than going through a service registry — see any form package's `*-workflow.test.ts` or this package's own.
- `restoreWorkflow`'s status check reuses `@forms/core`'s exported `knownStatuses` — a `Record<FormStatus, true>`
  used as a runtime witness for the `FormStatus` union — rather than keeping a second copy of the status list here.
- `transition`'s guard messages, and `restoreWorkflow`'s "not a status a form can have" message, are asserted on
  verbatim by several packages' tests. Changing the wording is a breaking change across the repo, not just here.

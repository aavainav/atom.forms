# `@forms/report-viewer`

**The top of the stack and the only part of it a host app renders.** A host names a form and hands over its data;
this package resolves the catalog item, builds the form model, populates it, mounts the options and panels the form
offers, and renders it. Depends on `@forms/audit`, `@forms/catalog`, `@forms/core`, `@forms/value-lists`,
`@forms/violations`, `@forms/printing`, `@forms/review`, `@forms/workflow`.

Module dependencies: `AuditModule`, `FormCatalogModule`, `ValueListsModule`, `ViolationsModule`, `PrintingModule`,
`WorkflowModule`.

It depends on every package whose capability it offers rather than letting them register into it. That direction is
the point: a form package, a violation list and a print copy all exist without a viewer, while a viewer is not much
without them. **Nothing anywhere depends on this package except a host** — no form package, no plugin package, not
even the workbench.

```
                report-viewer          ← what a host app renders
                 ↙   ↓   ↓   ↘   ↘   ↘
      catalog  value-lists  violations  printing  audit  review  workflow
```

## The whole API

```tsx
<ReportViewer identity={{ name: "S438 Citation Form", version: "1.0" }} dataManager={…} settings={{ showOptions: true }} />
```

Four props, nothing else:

| Prop | |
| --- | --- |
| `identity` | `IFormIdentity`. The catalog resolves it, answering with the latest version when none is named. |
| `dataManager` | `IReportViewerDataManager` — where the record is read from and written back to. Optional: without one the form renders blank and unsaveable. |
| `settings` | `IReportViewerSettings` — `mode?` (`FormMode`, defaults `"editable"`), `showOptions?` and `user?` (an `IActor`: who is using the report, which its audit records and review comments are attributed to). How the report renders, as opposed to which one. |
| `template` | Optional. The id of one of the host's templates: the report starts **new** from it in place of opening one, so `read` is called with `"new"` and the id, and the audit says `form-started` with the template rather than `form-loaded`. It is how a host's own launcher starts a report from a template. |

There is deliberately **no `controllers` prop**. A host needing shared controllers or a mutation of the loaded model
takes the advanced path instead: `IReportViewerService.loadForm(identity, dataManager)` then `<ReportViewerForm />`,
which is exactly what `ReportViewer` itself does. Both sandbox demos sit on that path.

`ReportViewer` keys its inner `FAsyncLoader` on `` `${identity.name}@${identity.version}` ``. That key is
**load-bearing**: `FAsyncLoader` runs its `op` once on mount, so without it a changed `identity` prop would leave
the previously loaded form on screen.

## Files

| Path | Contents |
| --- | --- |
| [src/module.ts](src/module.ts) | `ReportViewerModule`. Registers six services and nothing else — there is no configuration seam, because there is nothing left to register with it. |
| [src/services/report-viewer.ts](src/services/report-viewer.ts) | The heart: `IReportViewerDataManager`/`IReadDataResult`, `IInitialForm`, `IReportViewerService`, `IReportViewerOption(Props)`, `IReportViewerPanelProps`, and **the built-in option table**. |
| [src/services/modal.ts](src/services/modal.ts) | `IModalService`: `showModal`, `showConfirmModal`, `showSaveChangesModal`. Max 3 concurrent. Re-exports core's modal types, `IModalOptions` included. |
| [src/services/notification.ts](src/services/notification.ts) | `INotificationService.showNotification` — event only; the UI listens. A notification may name a `duration` (ms; `0` keeps it up until closed), otherwise its type's default applies. |
| [src/services/theme.ts](src/services/theme.ts) | `IThemeService`: `theme`, `setTheme`, `toggleTheme`, `onThemeChanged`. Holds the current theme rather than only raising an event, since the option button renders a different icon per theme. |
| [src/services/review.ts](src/services/review.ts) | `IReviewService.togglePanel` — event only, same shape as validation; `ReviewManager` listens. |
| [src/services/validation.ts](src/services/validation.ts) | `IValidationService`: `showIssues` (event only, same shape as notification; `ValidationManager` listens) and `validate(controllers)`, which runs the rules, shows what they found, marks the failing fields on the form and answers with the `RuleIssueCollection`. The Validate button and the workflow option both go through it. |
| [src/components/report-viewer.tsx](src/components/report-viewer.tsx) | `ReportViewer` and `IReportViewerSettings`. Also the one `import "@forms/core/theme/_main.scss"` in the graph. |
| [src/components/report-viewer-form.tsx](src/components/report-viewer-form.tsx) | Owns the `ControllerManager`, wires `useFormController`, applies the form's mode, sets the delete-page confirmation, builds the `onError` the plugin components report through, calls `useAuditRecorder`, and renders `WorkflowActions` above the form. |
| [src/components/report-viewer-options.tsx](src/components/report-viewer-options.tsx) + [options/](src/components/options/) | The floating bottom-right bar: it renders whatever `getOptions` answers with, under a suspense boundary. `options/` holds this package's own six. |
| [src/components/workflow/workflow-actions.tsx](src/components/workflow/workflow-actions.tsx) | `WorkflowActions` — **not** an options-bar entry; see *Workflow* below. |
| [src/components/options/report-data-option.tsx](src/components/options/report-data-option.tsx) + [report-data-dialog.tsx](src/components/options/report-data-dialog.tsx) | The `#report-data-button`, and the modal showing the bundle on tabs -- Report data, Audit history, Comments, Workflow (the record's `workflow` stamp, only when the form has one), and All data (the whole bundle, as `writeBundle` receives it) -- as formatted JSON, with a Copy action that copies the tab showing. Opening the dialog, moving to a tab and copying one are each recorded by the audit (`report-data-viewed`, `report-data-copied`), naming the tab and never its contents; a copy the browser refuses is not. The dialog is the **body** only — the chrome belongs to `IModalService`. |
| [src/hooks/use-audit-writer.ts](src/hooks/use-audit-writer.ts) | `useAuditWriter`: hands the audit controller's session records to the data manager's `writeAudit`, only the ones it has not yet handed over. |
| [src/components/modal/manager.tsx](src/components/modal/manager.tsx) · [notification/manager.tsx](src/components/notification/manager.tsx) · [validation/manager.tsx](src/components/validation/manager.tsx) | Subscribe to their service's events and render `FModal` / `FNotification` / the validation off-canvas. |
| [src/components/notification/notification-items.ts](src/components/notification/notification-items.ts) | What `NotificationManager` shows and how: `addNotification` merges a raised notification into the list. Owns `maxNotifications` (3) and `defaultDurations` (danger 10s, warning 8s, info/success 5s). |
| [src/components/panel/manager.tsx](src/components/panel/manager.tsx) | Mounts the violations panel, for a form that declares a `violationListId`, and the presets panel, for an editable form whose host has `readPresets`, alongside the other managers. |
| [src/components/panel/presets-panel.tsx](src/components/panel/presets-panel.tsx) + [preset-list.tsx](src/components/panel/preset-list.tsx) · [preset-preview.tsx](src/components/panel/preset-preview.tsx) · [preset-save-form.tsx](src/components/panel/preset-save-form.tsx) | The presets panel, an off canvas on the end edge, and its three parts: the searchable list, the preview of what applying the chosen preset would do, and the step a preset is saved from -- a controlled form whose state the panel holds, so that Save can sit in the panel's footer. See *Presets* below. |
| [src/utils/](src/utils/) | The pure logic the panel is built on: `plan-preset.ts` (what applying a preset comes to), `savable-groups.ts` (what a preset could be saved from, and building one from what was ticked), `is-answered.ts` and `humanize.ts`. |
| [src/components/options/new-form-option.tsx](src/components/options/new-form-option.tsx) + [template-picker.tsx](src/components/options/template-picker.tsx) | The `#new-form-button`. A host that offers templates (`readTemplates`) has the user pick one first, in a modal: `TemplatePicker` is the **body** only, listing the form's own default as "Blank" (unless the host flags a default of its own, which replaces it) and then the host's templates, under their `group` headings. Only one thing to start from means no question asked, and cancelling the picker leaves the form as it is, without asking about its unsaved changes. See *Templates* below. |
| [src/components/review/manager.tsx](src/components/review/manager.tsx) · [options/review-option.tsx](src/components/options/review-option.tsx) | `ReviewManager` mounts `@forms/review`'s markers and panel and writes the comments back through the data manager; `ReviewOption` is the button that toggles the panel. See *Review* below. |
| [src/components/validation/](src/components/validation/) | Off-canvas list of `IRuleIssue`s; `ValidationManager` owns the open/closed state, `Validation` is the plain presentational off-canvas. |

## `IReportViewerDataManager` — the host's side of the data

```ts
interface IReportViewerDataManager<TData extends object = IReportData> {
    read(reason: ReadReason, template?: string): Promise<IReadDataResult<TData> | undefined>;   // one object in
    readTemplates?(): Promise<ReadonlyArray<IReportTemplate>>;               // what a new report can start from
    write?(data: IReportData): Promise<void>;                                // the record, on Save
    writeAudit?(records: ReadonlyArray<AuditRecord>): Promise<void>;         // the audit records not yet handed over
    writeBundle?(bundle: IReportBundle): Promise<void>;                      // everything, on Save, in place of write
    writeComments?(comments: ReadonlyArray<IReviewComment>): Promise<void>;  // all the comments, on every change
}

interface IReadDataResult<TData extends object = IReportData> extends IPopulateData<TData> {
    readonly audit?: ReadonlyArray<AuditRecord>;        // the report's audit history, shown and carried on from
    readonly comments?: ReadonlyArray<IReviewComment>;  // the review comments made on it
    // and, from IPopulateData: data, readOnlyFields?, status?, workflow?
}
```

- **`read(reason, template?)` takes only why it is being called** -- `"open"` or `"new"` -- and, for a new one, the
  template the user picked. The host owns its own routing, so a manager closes over whichever record it was built for
  rather than being handed a context to guess from.
- **There is no separate notion of defaults.** A host with no record yet answers with the values a new one should
  start with; resolving `undefined` loads a blank form. One path, not two. A template is the same path with a name:
  the host answers `read("new", id)` with the finished record, and the report viewer never sees how it was put together.
- **`readOnlyFields` mirrors the shape of `data` itself**, marking whichever fields -- at any depth -- should come
  back locked rather than editable, e.g. `{ agencyName: true }`. `ReadOnlyFields<TData>` (from `@forms/core`) is
  typed against the contract, so a misspelled key is a compile error rather than a lock that silently does nothing.
  `IReadDataResult` and `data`/`readOnlyFields` travel together as one `IPopulateData<TData>` object all the way
  down to `FormModel.populate`, rather than being split into separate parameters partway through. A field the
  mapper has not wired up for locking (see `FormMapper.write` in `@forms/core`) stays editable regardless of being
  marked.
- **`status` and `workflow` come back with the record too, and take effect after the form is populated.** `status` is
  the status the record was stored with and `workflow` its `{ id, version, history }` stamp -- both are already in
  what `write` was given (`extractData` stamps them), so a host that stores the whole record can hand `saved.status`
  and `saved.workflow` straight back. `FormModel.populate` no longer restores them itself -- see *Workflow* below --
  `loadForm` calls `IWorkflowService.restoreWorkflow(form, result.status, result.workflow)` right after populating,
  so the lock the status carries (an issued citation's, a submitted crash report's) is applied again on load, and a
  status a form cannot have rejects the load. Without them the form keeps the status it was built with, `draft`.
- **The audit history and the comments come in with the record, in the one `read()` object, and go out through
  separate writes.** They are the host's to keep beside the record and never part of `write`'s data, and each changes
  on its own clock: the record on Save, the comments on every change, the audit as records are raised. So each has its
  own optional write, and `writeBundle` is the one call that takes everything at once. Without a write, the comments
  and the history last only as long as the form is on screen. `IReviewComment`, `ReviewTarget`, `AuditRecord` and
  `IActor` are re-exported from this package, so a host need not depend on the packages they come from.
- **`writeAudit` is append-only and gets only what is new**, one write at a time after each settled batch of records;
  the host adds them by `id`. **`writeComments` gets all of them** each time, since a comment can be resolved as well
  as added. **`writeBundle` is what Save calls when the host has one**, in place of `write`: a host that keeps a report
  as one document gets an atomic snapshot of `{ version, data, audit, comments, exportedAt }` (`IReportBundle`). A host
  that has both `write` and `writeBundle` is given the bundle only.
- **`write` doesn't depend on `TData`.** It always takes the full `IReportData` -- `FormModel.extractData()` stamps
  `name`/`status`/`type`/`version` on top of whatever the mapper narrowly produces, so what comes back out is never
  just the contract that went in. That's why the props, the options bar and `saveForm` all type their `dataManager`
  as `IReportViewerDataManager<any>` rather than being made generic over a `TData` they never call `read()` with:
  `any` erases only the part of the type they don't use, and `IReportViewerDataManager<IS438Data>` (say) is freely
  assignable to it either way, which a concrete default like `IReportViewerDataManager<IReportData>` is not --
  `IS438Data` doesn't itself carry `name`/`status`/`type`/`version`, so it isn't assignable to `IReportData`.

## Load and save

`loadForm(identity, dataManager?)`:
1. `formCatalogService.get(identity)` — resolves and caches the catalog item, calling its `load()` at most once per
   identity, ever.
2. `let form = await new catalogItem.ctor().initialize()` — builds the form and every one of its pages.
3. `await dataManager?.read(reason, template)`; if it answered, `form = await form.populate(result)` -- the form's own `populate`
   decides for itself whether it has a mapper to run (awaited either way, since a repeating-page mapper must create
   pages, which is async; a form with no mapper just returns itself unchanged) -- then
   `form = workflowService.restoreWorkflow(form, result.status, result.workflow)`, the explicit second step that
   restores the record's status and workflow history and applies the lock its status carries. Safe to call
   unconditionally, even for a form with no workflow: see [`@forms/workflow`](../workflow/CLAUDE.md#restoreworkflow--the-two-step-load).
4. → `IInitialForm { audit?, catalogItem, comments?, form, hasRecord, reason, template?, Component }`: the audit history
   and the comments the read returned ride along, and `ReportViewerForm` loads them onto the controllers. `hasRecord`
   (the read answered), `reason` (`open` or `new`) and `template` (the one a new form was started from) say how the
   form came to be, which `getArrival(initialForm)` turns into the `FormArrival` the audit reports: loaded, with the
   counts of what came with the record, or started -- naming the template when there was one, and only then. A new
   form is started even when the host gave it defaults or a template.

**The form is self-describing -- its own `mapper`, `valueListIds` and `violationListId` travel with it.** Nothing
here reaches into the catalog item to decide what the form can do; it asks the constructed `form` instead.

`ReportViewerService.extractData(form)` delegates to `form.extractData()`: `form.mapper?.extract(form)` (or `{}`),
then **stamps the whole of `IForm` -- `name`, `description`, `status`, `type`, `version` -- from the form model
itself**, which declares the identity it is registered under and assigns it to itself. Without the stamp the saved
data could not be resolved back to a form. Persists nothing.

`saveForm(form, dataManager?, controllers?)` is `extractData(form)` then `dataManager?.write?.(data)`, returning the data
whether or not it was consumed -- or, when the data manager has a `writeBundle` and the controllers are given, the
whole `getBundle(form, controllers)` in one `writeBundle` call instead. `getBundle` gathers the data, the audit
history and the comments into one object and persists nothing; the ref's `getBundle()` returns the same. The extract-and-stamp lives on the form alone so that **what a preview shows and what a
save sends cannot drift** — the report-data option renders exactly this payload without touching the writer.

`canExtractData(form)` is `!!form.mapper`. `canSaveForm(form, dataManager?)` is that *plus* `write` or `writeBundle`.
They are different gates on purpose: a form with a mapper but nowhere to write still produces perfectly good
outgoing data, so the report-data option is offered where save is not. Both exist only as `ReportViewerService`
instance methods now -- not free functions -- so `ReportViewerModule.configure` reaches the singleton through
`services.get<IReportViewerService>(IReportViewerService)` to pass them as `canShow` closures.

## Templates

A **template** is a named starting point for a new report. The host offers them with the optional
`readTemplates(): Promise<ReadonlyArray<IReportTemplate>>` -- `{ id, title, description?, group?, isDefault? }`, and
**no data**: the data comes with `read("new", id)` when one is chosen, which is where a host learns that a new report
began (the sandbox clears what it kept for the last one and stamps the url there). So a host with a server lists the
templates cheaply and fetches the one chosen.

- **The form's own default is built in.** What a form makes of itself when it initializes -- today's date, a ticket
  number, closed to editing -- is the default every new report starts from, and needs nothing from the host. It is
  listed in the picker as "Blank", never by a host. Only what is true of every agency using the form belongs to it.
- **`isDefault` replaces it.** A host that flags one of its templates as the default has it start every new report
  that is not started from another, and the form's own is then *not offered*, so that an officer cannot pick it to
  skip whatever the agency locks (a court name, an agency name). At most one is flagged.
- **Only one thing to start from means no question is asked.** No `readTemplates`, or an empty list, is exactly the
  flow before templates: `read("new")`. A single template flagged as the default starts straight away. Two or more
  choices open the picker, which has the default selected, or Blank when the host names none.
- **The pick comes before the unsaved-changes guard**, so cancelling the picker never asks whether to discard
  anything. The chosen id is held in a variable the Start action reads, as the report-data dialog holds its active
  tab: a modal's actions are fixed when it opens and cannot see the dialog's state.
- **Composition is the host's.** A template built from several pieces of data -- a preset for the agency, another for
  the road conditions -- is put together by the host, which answers `read` with one finished record. The report
  viewer has no notion of a template's parts; see `createExampleDataManager` in the sandbox for one way to do it.
- **A host's own launcher starts one with the `template` prop** on `ReportViewer`, which loads with `"new"` and the id
  in place of `"open"`, so the audit says `form-started` from that template rather than a load.

## Presets

A **preset** is a named piece of data an officer applies to the report they are already writing; a template
(above) starts a new one. The host offers them with `readPresets(): Promise<ReadonlyArray<IReportPreset<TData>>>` --
the data comes with them, since applying is done here and the preview needs it -- and lets the officer keep their
own with `writePreset(preset)` and `deletePreset(id)`, which the panel offers only when the host has them. A preset's
`data` is in the form's own contract, so it can set a field on the report and, in a list of pages such as `persons`
or `units`, a field on each page: the lists are **paired with the report's by position**, and one longer than the
report's adds pages. The mapper adds them, from the array's length; it never removes one.

- **`planPreset(preset, current, locked, overwrite)` decides what is written**, before `populate` is asked:
  - a field the host **locked** is never written, whatever the mode, and is `locked`;
  - a field the report **answers** is not written unless told to overwrite, and is `answered`. Blank text, an
    unchecked box, nothing, an empty list, **a zero and an option box with nothing chosen** are unanswered: a report
    holds a box left alone as false, a number left alone as 0 and an option left alone as a blank `{ value: "",
    description: "" }`, which cannot be told from an answer, and counting them as answers would leave every such
    field forever "answered" on a real form;
  - a field already holding what the preset sets is neither written nor skipped;
  - an option box's `{ value, description }` is one field, and is named as itself (`isRecord` in `@forms/core`);
  - a mark on a whole list, or a whole page, locks everything on it; a page is found in the marks by position.
  It answers with the data left to write, the paths it sets, the pages it adds (`pages`), the preset's own locks cut
  down to what was written, and what it skipped -- each as a path (`persons[1].nonMotoristUnitType`) with why.
- **Which fields are locked is what the form remembers.** `FormModel.populate` keeps the `readOnlyFields` it was given
  (`FormModel.readOnlyFields`), merged with those it already had, so the panel reads them off the form and needs no
  registry of its own. It knows only the locks the host declared: a form's own stamps, a workflow's locked sections
  and a field its own rules disable are not in it. Fill-empty mode still leaves an answered one alone; **overwrite
  mode does not**, and would write over one of those.
- **A host preset's own locks are applied with it**, for what it wrote, so it can settle a field for the rest of the
  report. A preset an officer saved never has any.
- **One change, one undo.** The panel populates the form as it stands, checks it was not edited while it waited (a
  form that adds pages is async) and, if it was, applies nothing and says so. Then it makes **one** update, with
  `reason: { kind: "preset-applied", preset }` -- the same seam as `violations-added` -- so the audit names the fields
  it changed from the diff. What it skipped is recorded after, one `preset-skipped` for each field.
- **Saving keeps what was ticked, grouped by where it sits.** `getSavableGroups` offers the report's own single
  fields, then each page of each list, leaving out what is unanswered, what the host locked, and the report's identity;
  `getPageLists` offers to keep the number of pages of a list, blank; `toPresetData` builds the data from the paths
  ticked and holds a page's place with an empty record for each page before it. **Nothing is ticked to begin with**:
  a person page holds names and licence numbers, and the officer chooses. The host may refuse in `writePreset` by
  throwing, and the panel shows why. A nested record inside a page is not offered.
- **Save and Cancel are in the panel's footer, not beneath the list, and say what is missing.** A preset needs a
  name *and* something ticked; on a full report the list runs to dozens of rows, so with the actions beneath it an
  officer could tick everything and be left with a disabled Save and no sight of the name box, far above. The
  footer is an `FOffCanvas.Footer`, pinned as Apply's is, and its line beside Save says why it is disabled (`getSaveBlocker`: "Name the
  preset to save it.", then "Tick what to keep.") and otherwise counts what will be kept. `PresetSaveForm` is
  **controlled** for that reason -- the panel holds the draft, and starts it empty each time the step opens -- and
  puts the cursor in the name box.
- **The audit is told each of the three**: `preset-applied` and `preset-skipped` (above), `preset-saved` (the paths
  ticked) and `preset-deleted`, never a value.
- **`ReadOnlyFields` types an optional list as a plain `boolean`**, so a contract's `persons?: ReadonlyArray<...>`
  cannot be locked page by page in a typed way today. `planPreset` and the save step understand a `true` on a whole
  list, and marks by position where a host builds them.

## The options bar — a closed list, gated by the form instance

`registerOption`/`registerPanel` are **gone**. The options are declared in one table in
[src/module.ts](src/module.ts)'s `configure`, in the order the bar renders them:

| id | offered when |
| --- | --- |
| `validate` | always |
| `review` | `canReview`: a `"reviewable"` form; an `"editable"` one only when the data manager can keep comments (`writeComments` or `writeBundle`) |
| `violations` | `!!form.violationListId` |
| `presets` | an `"editable"` form, and a data manager with `readPresets` |
| `report-data` | `!!form.mapper` |
| `print` | always |
| `day-night-mode` | always |

`getOptions(form, dataManager?)` **stays** as a read API: it answers with a complete, ordered, already filtered
list, so **what a form offers can be asked for without rendering any of it** -- `ReportViewerOptions` calls it with
`controllers.getFormController().form`, deciding per rendered instance rather than off anything static.

Two of the seven components are imported from packages *below* this one (`ViolationsOption` from `@forms/violations`,
`PrintOption` from `@forms/printing`) rather than being handed up through a registration seam. All seven go through
`React.lazy`, so the bar renders under a `<Suspense fallback={null}>`; the report viewer's own five genuinely split
into their own chunk. Every one of them is rendered with `IReportViewerOptionProps`, which is a **superset** of what
any one option takes — a component declaring fewer props is assignable, so no adapters are needed.

**`showModal` and `onError` are props, not services.** The two components from below cannot resolve this package's
services, so the bar hands down a `showModal` bound to `IModalService` and an `onError` bound to
`INotificationService`. The modal in particular has to be opened at the viewer's root: the bar is `position-fixed`
and therefore a stacking context, and a modal opened inside one is painted under the backdrop appended to the body.

The trade-off this closes: **a third party can no longer add an option.** That was accepted deliberately in exchange
for the dependency direction.

### Where a per-form gate should live

A gate reads the form instance, so it can use anything the form self-describes: its identity, `type`, declared
`violationListId`/`valueListIds`, and the form family via `form instanceof CitationForm`. Prefer a declaration on
the form over an inferred one — the violations gate is `!!form.violationListId` precisely because that is the form
saying so, rather than the viewer working it out from what happened to be registered elsewhere. A gate that needs
something before the form is even constructed (the catalog listing, say) only has the cheap, registered
`IFormCatalogItem` to work with -- `type` is there for exactly that; nothing else about the form's own behavior is
knowable without loading and constructing it.

## Workflow, and the action bar above the form

**Not an options-bar entry.** `ReportViewerForm` renders `WorkflowActions` unconditionally, right before
`initialForm.Component`, regardless of `showOptions`. It used to be two separate options-bar entries --
`WorkflowOption` and `SaveOption`, floating icons alongside Print and the day/night toggle -- but both are primary
"do something to this report" actions rather than utilities, and hiding them behind `showOptions={false}` meant a
host could suppress the one affordance a report actually needs. They are now one header above the form: its title,
its status, a Save button, and a button for each transition it can make now. The component renders nothing for a
form that has neither a workflow nor anything to save.

The split follows the dependency graph: `@forms/core` depends on nothing above it, so the presentational half lives
there and the orchestration -- including Save's -- stays here.

- **`FFormHeader`** (`@forms/core`) is a plain, prop-driven header -- `title`, `subtitle?`, `borderVisibility?`,
  and `children` as an actions slot. No workflow or save knowledge at all.
- **`FWorkflowActions`** (`@forms/core`) is an icon button (no text -- see *Icons, not text* below) for each
  `IAvailableTransition` it is given, disabled and tooltipped off a blocker computed from `openComments` and `user`
  (both plain props -- core can reach neither a review controller nor a service). A click just calls
  `onSelect(transition, user)`; it validates, confirms, saves and applies nothing itself.
- **`WorkflowActions`** (here, `src/components/workflow/`) is what `ReportViewerForm` actually renders. It reads
  the live form (`useForm(formController)`) and the review controller's open-comment count, and renders
  `<FFormHeader title={form.name} subtitle={toWords(form.status)}>` around a Save button (own markup, gated on
  `reportViewerService.canSaveForm(form, dataManager)`, independent of `form.workflow`) and
  `<FWorkflowActions ... />` (gated on `form.workflow`, its `transitions` prop from `IWorkflowService.getTransitions`,
  and supplied `onSelect` with the orchestration below). `IValidationService`, `IModalService`, `INotificationService`,
  `IWorkflowService` (`@forms/workflow`) and `@forms/audit`/`@forms/review` all stay here, one level above core.

### Icons, not text

Every button in the header -- Save and every transition -- is icon-only, tooltipped with its label since it carries
no visible text (`FWorkflowActions` always wraps its button in an `FTooltip`, not only while disabled). A transition
names its icon on itself: `IWorkflowTransition.icon` (`@forms/core`) is a required bootstrap icon name, so a
workflow that adds a transition has to pick one rather than the button silently falling back to something generic.
Save keeps the `"floppy"` icon it always had.

### Making a transition

`FWorkflowActions` follows the form as it moves (`workflowService.getTransitions(form)`: its status and its mode
both match). **Who acts is the host's to say, through the mode** -- the officer's session is `"editable"`, the reviewer's
`"reviewable"` -- and `WorkflowActions` is handed `settings.user` as `user`, which is who a change is attributed to.
A report reaches the viewer in one status and leaves in another, **moved once**: a report that takes several people
is opened again for each, and the host keeps it between times. After a move the form usually closes (its lock), so
the buttons go and the next person loads it.

Clicking one, in order:

1. **validate**, through `IValidationService.validate` -- an error stops it with a notification and the issues panel open;
   a warning does not.
2. **confirm** in a modal saying where the status is going.
3. **build the candidate**, `workflowService.transition(form, id, user, { issues, openComments })`, which is pure.
   It throws if the transition cannot be made; that is shown as a notification and nothing is saved.
4. **save the candidate**, through `saveForm`, when the form can be saved at all. A failure records `save-failed`,
   notifies, and leaves the form on screen untouched.
5. **apply it**, `update(() => candidate.clean())`, and only then record `saved`.

**Saved before it is applied**, so a failed save cannot leave a transition in the audit history that was never kept:
the audit raises `workflow-transition` from the form's history as the form is replaced (see `@forms/audit`). The catch
is that a bundle-only host's bundle does not hold this transition's audit record until its next save -- the same as
`saved` today -- though `data.workflow.history` has the transition in it.

A guard the transition names is checked in the button before it can be clicked: `hasOpenComments` disables it, with a
tooltip saying to add a comment, until the review controller counts one open; `noOpenComments` (crash's `submit`, once
rejected, and its `approve`) disables it until every comment is resolved. Both follow the count through `useReviewComments`. Without a
`user` every button is disabled, and says why, the way commenting is. The tooltip
sits on a wrapper because a disabled button raises no mouse events, and is keyed on its reason, since bootstrap reads a
title once.

## The panel seam — where an off canvas goes

`PanelManager` mounts the violations panel at the report viewer's root, beside `ModalManager`,
`NotificationManager` and `ValidationManager`, on the same `violationListId` gate the option uses.

**A panel cannot be rendered from the option that opens it.** The options bar is `position-fixed` and therefore a
stacking context, which ranks anything fixed inside it only against the bar's own contents however high its
z-index — the same trap that put the print dialog behind `IModalService`. A panel is mounted for as long as the form
is and decides for itself whether it is showing, which is what lets the option be a plain button raising an event on
a service.

## Review

`ReportViewerForm` mounts `ReviewManager` when `reportViewerService.canReview(form, dataManager)` -- a `"reviewable"`
form always, an `"editable"` one only when the host can keep comments for the officer to resolve, a `"viewable"` one
never -- and the `review` option is gated on the same call.

**`ReportViewerForm` does the setting up, before anything below subscribes:** during render it hands the user
(`settings.user`) to the manager, and how the form arrived (`getArrival`) -- **before the form is loaded**, since the
audit records `form-loaded` or `form-started` as the load creates it and reads both then. `NewFormOption` sets the
arrival the same way before it swaps a new form in. It also loads what the host held -- `initialForm.audit` into the audit controller,
`initialForm.comments` into the review controller -- once for each form it is given, in a **layout effect**. That is
not during render, because a mounted component subscribed to the comments (the workflow actions count the open ones)
would be updated while `ReportViewerForm` renders, which React warns about whenever a viewer is handed a different form.
It is not in an ordinary effect either: the manager's writer subscribes in an effect that runs *before* the parent's,
so loading there would be written straight back, and a layout effect runs before every such effect. Without a user, or
once the report is out of review, a `"reviewable"` form shows its comments but cannot add any.

The manager, beside the other managers at the viewer's root:

- **saves on every change.** Every add, resolve or reopen calls `writeComments` with the full list -- one write at a
  time, a change landing mid-write costing one more write of the latest. The data manager is read through a ref, so a
  host that rebuilds it on every render does not restart the writer. A failure goes to `onError`.
- **renders the layer and the panel**, giving both a `showModal` bound to `IModalService`, so the thread modal opens
  at the viewer's root and not inside a report.

The panel's open/closed state is the manager's own, toggled through `IReviewService` -- the same shape as the
violations panel. `ReviewOption` raises that event, and badges its button with how many comments are open (an
`FBadge`, gone at zero), following the count through `useReviewComments`.

The review panel is on the end edge, and so is the violations panel. A form that offers both should not have them
open together.

## Day/night mode

Bootstrap 5.3 resolves its color mode from a `data-bs-theme` attribute and the compiled theme already carries the
whole dark palette, so `ThemeService.setTheme` stamps the attribute on `document.documentElement` and nothing else
is needed. It goes on the document rather than on an element the viewer renders because the viewer never owns the
document, and the host's own chrome should follow the toggle too.

**`FPage` pins itself back to `data-bs-theme="light"`.** A page is a printed document: it is white paper with a
dark border in either mode, and letting the attribute cascade into it would leave every input, select and checkbox
on the page rendered dark against white. Bootstrap supports nesting color modes, so pinning the page converges on
dark chrome around light paper, and leaves the print branch unaffected whichever mode the app is in.

The theme is **not persisted** — it survives in-app navigation, since the service is a singleton living as long as
the app's runtime, but a reload starts light again.

## Auditing

`ReportViewerForm` calls `useAuditRecorder` from `@forms/audit`, which forwards what the form's audit controller
records to `IAuditService`, and `useAuditWriter` hands the same records to the data manager's `writeAudit`. Both
attach to the controller manager and let go when the viewer really goes, which `useFormController` tells it, so the
`form-closed` the audit raises then is still forwarded and written. A page put away (`pagehide`) closes the manager
without letting go, so one the browser restores from its cache carries on and records a `form-restored`. A host that
wants them live subscribes once, at startup, and never renders anything:

```ts
services.get<IAuditService>(IAuditService).onRecord(record => send(record));
```

`IAuditService`, `AuditRecord` and `IAuditFormIdentity` are re-exported from this package. Records carry field paths
and identity, never values, and `by` -- the `settings.user` -- when there is one; see [`@forms/audit`](../audit/) for
what is recorded and how. The history a host handed back through `read()` is loaded onto the audit controller, so the
report data dialog and the bundle show it ahead of this session's records. **The viewer never writes the loaded
history back**: `writeAudit` is given only the session's records, for the host to append by `id`.

**Saving is the one thing the audit cannot observe**, so `WorkflowActions`' Save button and the save path of
`NewFormOption` tell it (`getAuditController(controllers).recordSaved()` / `recordSaveFailed()`). A dirty→clean
transition is ambiguous, since starting a new form calls `clean()` too. Anything new that saves must do the same.

## Routing — there is none

This package registers no routes, owns no navigation service, and does not depend on react-router at all. A route is
the host's, and the root layout plus the `*` not-found live in [`@forms/workbench`](../workbench/). `ReportViewer`
is a component; mount it wherever the host's router puts it.

## Gotchas

- `IReportViewerOptionProps.user` is `settings.user`, threaded `ReportViewerForm` → `ReportViewerOptions` → each option,
  though no built-in option reads it today. `WorkflowActions` -- not an option -- is handed `user` the same way, since
  it is what acts in the user's name now.
- `ReportViewerForm` creates its own `ControllerManager` unless one is passed in. **Pass one in** when something
  outside the form (a panel of draggable items) needs the same controllers.
- Any mode but `"editable"` is applied by `form.setMode(mode)` (disables every field and stamps `mode` on the model).
  Everything downstream — add/delete page, drop handlers, the watermark, placeholders — reads `form.mode` (or
  `binding.mode`) off the model itself rather than taking a separate prop; see [`@forms/core`](../core/CLAUDE.md)'s
  `FPageCollection`. It is a **per-instance** setting, not an app-wide one: an issued citation versus a draft is a
  per-record decision.
- The delete-page confirmation is installed here (`controller.setConfirmDeletePage`) and removed on unmount, so it
  cannot be skipped by a form that forgets to supply one.
- The save button reads `controllers.getFormController().form` **at click time** — the controller replaces the model
  on every edit, so a captured form would be stale.
- `ModalService` throws past three concurrent modals.
- **The theme import lives on `report-viewer.tsx`.** It is the only one in the graph; move it and a host renders
  unstyled.
- Since this package depends on violations, printing and audit, **every host ships them**. The list *data* is still
  dynamically imported by its own definitions, which is where the real weight is.

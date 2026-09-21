# `@forms/printing`

Puts a form onto paper. Owns the **copies** a form publishes, the dialog for choosing between them, the print
button an options bar renders, and the `@page` rules a print needs. Depends on `@forms/catalog`, `@forms/core`.

Module dependencies: `FormCatalogModule`.

**This package sits below whatever renders a form, and reaches nothing upward.** It registers its option nowhere;
`@forms/report-viewer` imports `PrintOption` and mounts it itself. There is no bootstrapper here either — a host
gets printing by rendering a report, not by naming it at startup.

**There is no PDF library here.** Printing is a print stylesheet plus `window.print()`; the user takes the PDF from
the browser's own print dialog with "Save as PDF". That keeps the text vector rather than a rasterized image, keeps
the printer's own settings in play, and adds no dependency.

## Why a copy exists

A citation is rarely printed whole. The paper form is a multi-part set whose parts carry different pages, and who a
part is going to decides which pages it carries — an OKC traffic citation hands the violator the complaint and the
warrant, while the court is filed the complaint and the supplement. An `IPrintProfile` names those pages and how
they sit on the sheet. Nothing else about a form changes to support one.

## Files

| Path | Contents |
| --- | --- |
| [src/module.ts](src/module.ts) | `PrintingModule` + `IPrintingConfiguration` (`registerProfiles`). Registers the print service and nothing else. |
| [src/options.ts](src/options.ts) | `IPrintingOptions`: `margin` (inches), `orientation`, `paper`. Bound to module settings; these are the defaults a copy naming none of its own is printed with. |
| [src/models/print-profile.ts](src/models/print-profile.ts) | `IPrintProfile`, `PrintOrientation`, `PrintPaper`. |
| [src/services/print.ts](src/services/print.ts) | **The heart.** `IPrintService` (read) / `IPrintRegistrationService` (write) and the `PrintService` implementing both. |
| [src/components/print-option.tsx](src/components/print-option.tsx) | The `#print-button` for an options bar, `IPrintOptionProps`, and the `showModal` call that opens the dialog. |
| [src/components/print-dialog.tsx](src/components/print-dialog.tsx) | The copy + layout picker. The **body** of the modal only — the chrome belongs to whoever handed down `showModal`. |

The print **layout** itself is not here — it is `FPageCollection`'s print branch and
[`@forms/core/theme/components/_print.scss`](../core/theme/components/_print.scss), because core owns `.f-page` and
the component that renders it. This package owns every decision *about* a print; core owns the rendering of one.

## How a print runs

`IPrintService.print(controllers, catalogItem, request)`:

1. resolve the copy and settle `layout`, `orientation`, `paper` and `margin` (copy → module options → built-in
   default). A side-by-side copy naming no orientation is printed **landscape** — a pair of pages is half again as
   wide as a sheet is tall;
2. `validateProfile` — a copy naming a page the form does not carry **throws**, rather than printing a blank sheet.
   The page names are checked against `new catalogItem.ctor().getChildDefinitions()`;
3. unless the form is already `"viewable"`, switch it to `"viewable"` via `formController.setForm(form.setMode("viewable"))` --
   a printed page is a copy of the record, not a form to edit or review, so it renders exactly as viewing a finished
   one would (see **Printing is viewable** below);
4. write `@page { size: <paper> <orientation>; margin: <margin>in }` into a `<style id="f-print-page-rules">` in the
   head. An `@page` rule cannot be selected by a class, so it has to be swapped at print time;
5. `printController.begin({ layout, pageNames, scale })` — the page collection drops its tab strip and renders the
   copy's pages flat;
6. wait two animation frames, measure, and `begin` again with the scale that fits the copy onto its sheet;
7. `window.print()`;
8. in a `finally`: `end()`, remove the `@page` rules, and restore the form to the exact object captured in step 3,
   if it was switched. `window.print()` blocks until the print dialog is dismissed, so by then the sheets have been
   rendered.

## Printing is viewable

**A printed page renders exactly as a viewable one would, because printing switches the form to viewable mode for
the duration of the print.** An in-progress draft printed mid-edit looks the same as printing the finished record
later would: fields disabled, no placeholders, the status watermark stamped. Nothing in `@forms/core`'s rendering
has to know printing is happening at all — `FPageCollection`, `FFieldSelect` and `FFieldInput` all key off
`form.mode`/`disabled` exactly as they do outside of print.

The switch is restored by handing back the **exact form object captured before printing**, not by calling
`setMode("editable")` on the printed one. `setMode("editable")` deliberately never re-enables a field disabled for
another reason (a `readOnlyFields` lock, say), so it cannot undo the viewable switch by itself -- only restoring the
original object does. A form already `"viewable"` when printing starts (an issued citation) is left alone entirely,
so printing it does not raise a redundant form-controller update. A `"reviewable"` form is switched like an editable
one, so anything drawn only for reviewing stays off the paper.

## Scaling — the part with the sharp edges

- **Width always constrains. Height constrains only a side-by-side copy**, where fitting the pages onto the one
  sheet is the whole point of asking for it. A form page is far taller than it is wide — taller than a sheet on the
  longer citations — so holding a top-down copy to the height of a sheet too would shrink it to a third of its size
  for no gain: its pages already start on a fresh sheet, and one that runs long simply continues onto the next.
- **A page is only ever shrunk, never enlarged.**
- **`zoom`, not `transform: scale()`.** `zoom` shrinks the layout box along with the content, so the pages still
  paginate onto sheets after being scaled; a transform would leave the layout at full size and paginate as if
  nothing had been scaled. This was measured, not assumed.
- **`fitSafetyFactor` (0.95) is not decoration.** The pages are measured on screen but laid out again under print
  media before they print, and that second layout is not identical — bootstrap ships `@media print` rules of its
  own, and a form page measures about 3.5% taller under them. Fitting a copy to the last pixel of the sheet hands
  the printer something slightly too big and turns one sheet into two. For the same reason,
  `.f-print .f-page`'s print styling in `_print.scss` deliberately applies in **both** media rather than only under
  print: a rule that moved the pages after they were measured would invalidate the measurement.

## Registering copies — the seam

From a form package's `module.ts` `configure`, alongside `catalog.registerCatalogItem`:

```ts
config.get<IPrintingConfiguration>(IPrintingConfiguration).registerProfiles({ name, version }, [
    { id: "violator", name: "Violator copy", description: "...",
      layout: "side-by-side", pages: ["complaint-page", "warrant-page"] }
]);
```

- `pages` are page definition **names** — the keys of the form's own `getChildDefinitions()`. Selecting by name rather
  than by definition is what lets a copy be declared as plain strings, and it means a name belonging to a page type
  that **repeats** contributes every instance of it (TR-310's "All pages" prints all seven).
- Keyed `` `${name}@${version}` ``. **Registration throws without a version**, for the same reason a catalog item's
  own registration does: lookup goes through a resolved catalog item, which always names a concrete version.
- One set per identity, and duplicate ids within a set throw.
- **A form that registers nothing still prints.** `getProfiles` falls back to a single "All pages" copy of every
  page type, top-down. Printing works for every form in the catalog on the day it is registered.

## The option's props — what the host hands down

`PrintOption` resolves only `IPrintService`. Everything else arrives as `IPrintOptionProps`:

```ts
{ catalogItem, controllers, title,
  showModal: (options: IModalOptions) => void,   // opens the dialog at the host's root
  onError?:  (message: string) => void }         // reports a print that could not run
```

Both functions are props rather than services because this package sits below whoever renders it and cannot resolve
the report viewer's `IModalService` or `INotificationService` — and because a modal and a notification belong to the
host of an option rather than to the option. `IModalOptions` is typed from `@forms/core`, which is what makes the
`showModal` prop expressible from down here at all.

`showDialog`'s logic stays in this package: it owns the `IPrintRequest`, the profiles lookup, and the Cancel/Print
actions. Moving that up would couple far more than passing one function down.

## Gotchas

- **The dialog is opened through the handed-in `showModal`, never rendered from the option.** An options bar is
  `position-fixed`, which makes it a stacking context whatever its `z-index`; a modal rendered inside it ranks only
  *within* that context, while `FModal` appends its backdrop to `document.body` at `z-index: 1050` — so the backdrop
  paints over the whole bar, dialog included. The handed-in `showModal` puts the modal at the host's root instead,
  outside the bar.
- **The dialog reports its choice back through `onChange`, it is not read off the component.** The modal service is
  handed its actions when the modal opens, so those actions cannot re-render with the dialog's state; the option
  holds the latest request in a closure and the Print action reads it.
- The dialog's **Print action does not await the print**. It hands the request up and returns, so the modal closes
  first — the sheets must not carry a modal over them, and awaiting inside the action would set state on a
  component about to unmount.
- Picking a copy **moves the layout with it**, since each copy knows how it is meant to print. Changing the layout
  afterwards overrides that for the one print and is not remembered against the copy.
- The print option is **imported** by `@forms/report-viewer`, not registered with it. There is no registration seam
  in either direction: this package depends only on the catalog and core, and the viewer reaches down for the
  component. Which is also why nothing here can assume a report viewer is present — `PrintOption` works for anything
  that hands it the props above.

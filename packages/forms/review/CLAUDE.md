# `@forms/review`

Holds a reviewer's comments on a report: on the whole form, a page, a section or a field. Owns the comment types, the
controller that holds them and works out where in a form a control or a comment belongs, and the components that show
them. Depends on `@forms/core`.

Module dependencies: none.

**This package sits below whatever renders a form, and reaches nothing upward.** Like `@forms/audit`, it is
mounted by `@forms/report-viewer`, which sets the user, loads the comments the host held when it loads the form,
saves them back through the data manager, opens the thread modal, and offers the panel as an option. A form package
never depends on it.

**Comments are not part of the record.** They are review metadata the host keeps beside a report, never in its data
contract and never in a field's value.

## Files

| Path | Contents |
| --- | --- |
| [src/controllers/review-controller.ts](src/controllers/review-controller.ts) | **The heart.** `IReviewController`, `ReviewController`, `getReviewController`. |
| [src/models/review-comment.ts](src/models/review-comment.ts) | `ReviewTarget`, `IReviewComment`, and `getTargetKey`, which names a target so equal ones match. |
| [src/utils/placement-targets.ts](src/utils/placement-targets.ts) | `getPlacementTargets(placement)`: the targets a field can be commented on as -- itself, its section, its page. |
| [src/hooks/use-review-comments.ts](src/hooks/use-review-comments.ts) | `useReviewComments(controller)`: the comments, as a `useSyncExternalStore` snapshot. |
| [src/components/review-layer.tsx](src/components/review-layer.tsx) | `ReviewLayer`: a `FCommentMarker` portaled into the control of each field on the page showing. |
| [src/components/review-thread.tsx](src/components/review-thread.tsx) · [thread-modal.ts](src/components/thread-modal.ts) | `ReviewThread`, the body of the modal for one target, and `getThreadModal(controllers, target)`, which builds the `IModalOptions` to open it. |
| [src/components/review-panel.tsx](src/components/review-panel.tsx) · [review-entry.tsx](src/components/review-entry.tsx) | `ReviewPanel`, an off canvas listing every comment, and its `ReviewEntry`. |

## How it works

`ReviewController` is `@RegisterController("review")`, created the first time a manager is asked for it. It holds an
immutable array of comments, replaced on every change, so `comments` is the same array until something changes and can
be a `useSyncExternalStore` snapshot. `getComments(target)` builds a new array on each call and is **not** a snapshot.

- **A target names definitions, not ids.** Below the form it carries the page, section and field *names* their
  definitions have, plus `pageOrdinal` for a page that repeats. A model instance's id is a new uuid on every load, so
  it can never be saved; definition names are stable. Core's `FormModel.getFieldPlacements()` is the one query the
  package needs -- which definition, and which page instance, each field id belongs to -- and the names come from
  walking the definition chain (`getSectionDefinition()`, `getPageDefinition()`).
- **A shared section is one thing.** Its fields hold the same values on every page, so a comment on one of them, or on
  the section, is stored against page ordinal 0 and applies to every page's copy. A *page* target keeps its real
  ordinal.
- **Locating is cached by page structure.** `locateField` builds the id-to-placement map with one walk of the form and
  reuses it until the set of page ids changes, since field ids survive edits.
- **Jumping to a comment** is `getNavigationTarget`, which answers the `{ pageId, fieldId }` core's navigation
  controller wants. The placement map is in definition order, so a page or a section resolves to its first field. The
  whole form, and a comment whose page has since gone, answer `undefined`.
- **Naming a target** is `describeTarget`: "Vehicle > Details > Make", outermost first, from the titles the definitions
  carry. A repeating page is numbered ("Vehicle 2"); a shared section is not, since it is the same on every page. A
  target whose definitions have gone is named by the names it was made with, so an orphaned comment still says where
  it was.
- **The host owns persistence.** It hands comments over with `load` and writes them back on `onChanged`.
- **`add` fails loudly** unless the form is `"reviewable"`, a user has been set with `setUser`, and there is some
  text. The controller stamps the id, the time and the author itself, and the author is the user as an `IActor`, so a
  comment keeps who made it by id and not only by name. `canComment` is the same test without the text, so a
  reviewable form with no user named shows its comments but offers no way to add one.
- **`setResolved` works in any mode but `"viewable"`, and throws there.** The officer whose report is reviewed
  resolves comments as they deal with them, so an editable form can resolve and reopen; it cannot add. The components
  hide the button when `canResolve` is false rather than relying on the throw.

### The components

None of them takes a form, a context or a store -- each takes the **controller manager** and finds the review
controller (and, for the layer, the navigation and print controllers) through it.

- **Markers are portaled, and follow the page showing.** `ReviewLayer` asks the controller for the ids of the fields
  on the active page (`getFieldIds`) and, for each one, portals an `FCommentMarker` into the control found by
  `getFieldControl`. Only the active page's controls are in the document, so it reads `useActivePageId` -- core's
  `FPageCollection` reports it after each commit -- and draws nothing until there is one. It also draws nothing while
  the form is printing, so markers can never reach paper. An officer reading a report sees a marker only where a
  comment is; a reviewer sees one on every field, an invitation until it holds a comment.
- **The modal is opened by the host.** Like the print option, nothing here renders a modal: `ReviewLayer` and
  `ReviewPanel` take a `showModal(options)` and call it with `getThreadModal(controllers, target)`, so the modal
  lands at the host's root rather than inside the report. The thread inside it (`ReviewThread`) subscribes to the
  controller itself, so a comment added or resolved there shows at once, though the modal's options were fixed when it
  opened. It owns its own "Comment" button for the same reason -- a modal's actions cannot re-render with its state.
- **The panel is the whole-report view.** `ReviewPanel` lists every comment, open first and each group in the order
  made; the location above a comment navigates to it and closes the panel, the same way a validation entry does. It
  is where a reviewer comments on the report as a whole, since a form-level target has no control to carry a marker.

## Gotchas

- **Ordinals drift.** A comment on a repeating page is matched by position. If the officer adds or removes pages
  between review rounds, a comment can end up on a different page. Fixing that properly means persisting each page's
  identity in the record, which is every repeating-page mapper's business -- not this package's.
- **A rename orphans comments.** Renaming a page, section or field definition means its old comments no longer resolve.
- **The controller registers when its module loads.** `src/index.ts` exports it so importing the package is enough;
  giving this package `"sideEffects": false` would silently break that.
- **It throws if no form is loaded**, because it reads the form controller. That includes `canComment`.
- **Only `"reviewable"` with a user can comment.** An editable form's officer reads comments; adding is the
  reviewer's. The host sets the user before the components draw (the report viewer does it during render), since
  nothing raises a change when it is set.
- **A marker is placed when the layer renders.** It looks its control up in the document then, so a field that
  appears without a comment change, a page change or a print ending -- a conditionally shown section -- is not marked
  until the layer next renders.
- **The panel shares an edge.** `ReviewPanel` is on the end edge, the validation panel holds the start edge, and
  the violations panel holds the end edge too. A host that can offer both of those must not have them open together.
- **Mount the layer only where markers belong.** It draws whatever the controller says, in any mode; the host decides
  it does not belong on a `"viewable"` form.

## Tests

`yarn test` runs under `jsdom`, since the controller extends core's `Controller` and so loads the barrel. The
controller tests use a real `ControllerManager` with a **stub form** carrying only `mode`, `getPages`, `getPagesFor`
and `getFieldPlacements` (built in [test/fixtures/review-form.ts](test/fixtures/review-form.ts), with placements
whose definitions carry only names and titles), and `getPlacementTargets` is tested with plain stub definitions -- no
real form tree is needed, because the walk over one lives in core, where it is tested against the shared fixtures.

The component tests are `.ts` files that render through `createElement` and [test/fixtures/mount.ts](test/fixtures/mount.ts),
which mounts into a container attached to the document (a portal, and `getFieldControl`, need that), and provides
`click` and `type` -- React ignores a value set straight on a text area, so `type` goes through the native setter. The
layer tests draw a plain `div` carrying `data-field-id` for each field, standing in for core's controls.

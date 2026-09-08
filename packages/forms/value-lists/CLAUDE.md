# `@forms/value-lists`

The registry, service and code generator for the value lists backing form option fields, plus the **national**
(jurisdiction-free) lists themselves. Depends only on `@shrub/core`.

## Files

| Path | Contents |
| --- | --- |
| [src/module.ts](src/module.ts) | `ValueListsModule` + `IValueListsConfiguration.registerList`. Registers the standard lists in `configure` so later modules can replace them. |
| [src/services/value-list.ts](src/services/value-list.ts) | `IValueListService` (read) / `IValueListRegistrationService` (write) / `ValueListService`. |
| [src/models/value-list.ts](src/models/value-list.ts) | `ValueList` — a loaded list plus its lazily built indexes. |
| [src/models/value-list-definition.ts](src/models/value-list-definition.ts) | `IValueListDefinition`: `{ id, parentId?, load() }`. |
| [src/models/value-list-option.ts](src/models/value-list-option.ts) | `IValueListOption`, `IChildValueListOption`, `ValueListRow`, `toOptions(rows)`. |
| [src/value-lists.ts](src/value-lists.ts) | `ValueListId` (`state`, `vehicleMake`, `vehicleModel`) and `standardValueLists`. |
| [src/generated/](src/generated/) | Emitted list modules. **Never edit; never statically import.** |
| [data/](data/) | `lists.json` manifest + the source JSON per list. |
| [scripts/generate-value-lists.mjs](scripts/generate-value-lists.mjs) | The generator, also used by form packages via the `generate-value-lists` bin. |

## Core ideas

**Lists are addressed by id, not by a method apiece.** That is what lets a child list hang off a parent without
either being special: a child is a list whose definition names `parentId`, and every caller reaches it the same way.

**Registering over an id replaces the list.** This is the extension seam: a host serves one of the built-in lists
from its own source by registering a definition under the same id. `ValueListsModule.configure` registers the
standard lists first, so any module depending on it (which configures later) can override them.

**Ids are namespaced by owner.** The registry is one global namespace. A list with no jurisdiction and no form in it
is unqualified (`state`). A list belonging to one state or one form carries its owner as a prefix
(`sc-tr310:county`, `sc-432:county`) — otherwise whichever form loaded last would claim `county` and the loser would
quietly show the wrong data rather than fail.

## Loading and caching

- `ValueListService` caches the **promise** per id, so concurrent selects share one load; a rejected load is evicted
  so the next request retries. `registerList` drops anything cached under that id.
- `getOptions(listId, parentValue?)` on a child list with **no** `parentValue` returns `[]` **without loading the
  list at all** — that is what keeps the vehicle-model chunk unfetched until a make is chosen.
- `ValueList` builds `byValue` / `byDescription` / `byParent` indexes lazily on first use. Index keys on a child
  list are `` `${parentValue}|${key}` ``; **`|` is reserved** and the generator refuses any row containing one
  (or a tab or line break).
- `findByDescription` normalizes with `trim().toLowerCase()` — that is how a name arriving from a drag-and-drop
  drop is turned into the code a form stores. **First match wins** on genuine duplicates in legacy code lists.
- A child row with no `parentValue` is skipped when grouping (unreachable).

## The dynamic-import rule

Every generated module is reached through a `load` callback that imports it dynamically, and **must stay that way**.
A static import of anything under `src/generated/` — including a type-only import that a later edit turns into a
value import — folds that list's data back into the entry chunk and the code split silently stops working. This is
why [src/index.ts](src/index.ts) exports nothing from `./generated`.

## The generator

`yarn generate` → `node ./scripts/generate-value-lists.mjs --data ./data --out ./src/generated --row-import ../models/value-list-option`

Form packages run the same script through the `generate-value-lists` bin with the default
`--row-import @forms/value-lists`.

The lists to emit are declared by `<data>/lists.json`, so the script carries no knowledge of the package running it:

```json
[{ "source": "counties.json", "output": "counties.ts", "export": "counties", "doc": "…" }]
```

`doc` may be a string or an array of lines. Source rows are `{value, description, parentValue?}`; they are emitted
as flat `ValueListRow` tuples (`readonly [value, description, parentValue?]`) and expanded by `toOptions` at load
time — an option spelled out in full costs ~49 bytes to express ~20 bytes of data.

## Recipes

**Add a national list here**: drop the JSON in `data/`, add its entry to `data/lists.json`, run `yarn generate`, add
an id to `ValueListId` and a definition to `standardValueLists` with a dynamic `load`.

**Add a list owned by a form**: do it in the form package (see that package's `src/value-lists.ts`) with an id
prefixed by the form — not here. Only jurisdiction-free national code sets belong in this package.

**Make one list depend on another**: set `parentId` on the child definition. Nothing else changes; the service
groups the flat child rows by the `parentValue` each row carries, and the UI passes the parent's code as
`FFieldSelect`'s `parentValue`.

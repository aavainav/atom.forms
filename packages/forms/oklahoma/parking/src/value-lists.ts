import { IValueListDefinition, toOptions } from "@forms/value-lists";

/**
 * The ids of the value lists this form owns, prefixed with the form since the registry is a single global
 * namespace and registering replaces whatever already held an id. An unqualified `county` would be claimed by
 * whichever form loaded last, silently showing the wrong counties.
 */
export const OKParkingValueListId = {
    county: "ok-parking:county"
} as const;

/**
 * The value lists this form registers with the value list service.
 *
 * Only the counties belong to this form; states and vehicle makes are national code sets from `@forms/value-lists`.
 *
 * The generated module must stay reached only through a dynamic `load()` -- a static import under ./generated,
 * even a type-only one a later edit turns into a value import, folds that data back into this module's own chunk
 * and silently breaks the split.
 */
export const okParkingValueLists: ReadonlyArray<IValueListDefinition> = [
    {
        id: OKParkingValueListId.county,
        load: () => import("./generated/counties").then(module => toOptions(module.counties))
    }
];

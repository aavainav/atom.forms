import { IValueListDefinition, toOptions } from "@forms/value-lists";

/**
 * The ids of the value lists this form owns.
 *
 * They carry the form as a prefix because the value list registry is a single global namespace and registering a
 * list replaces whatever already held its id. An unqualified `county` would be claimed by whichever form loaded
 * last, and the loser would quietly show the wrong counties rather than fail. `ok-parking` is the form's route and
 * package name, and stays short in a cache key.
 */
export const OKParkingValueListId = {
    county: "ok-parking:county"
} as const;

/**
 * The value lists this form registers with the value list service.
 *
 * Only the counties belong to this form; the states and vehicle makes it also draws on are national code sets and
 * come from `@forms/value-lists` instead.
 *
 * The generated module is reached through a `load` callback that imports it dynamically, and must stay that way.
 * A static import of anything under ./generated - including a type-only import that a later edit turns into a
 * value import - folds that list's data straight back into whichever chunk this module lands in, and the split
 * silently stops working.
 */
export const okParkingValueLists: ReadonlyArray<IValueListDefinition> = [
    {
        id: OKParkingValueListId.county,
        load: () => import("./generated/counties").then(module => toOptions(module.counties))
    }
];

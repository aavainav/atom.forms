import { IValueListDefinition, toOptions } from "@forms/value-lists";

/**
 * The ids of the value lists this record owns.
 *
 * They carry the form as a prefix because the value list registry is a single global namespace and registering a
 * list replaces whatever already held its id. An unqualified `county` would be claimed by whichever form loaded
 * last, and the loser would quietly show the wrong counties rather than fail. `sc-432` is the form's route and
 * catalog name, and stays short in a cache key.
 */
export const PublicContactOrWarningValueListId = {
    county: "sc-432:county",
    gender: "sc-432:gender",
    raceEthnicity: "sc-432:race-ethnicity"
} as const;

/**
 * The value lists this record registers with the value list service.
 *
 * These are the lists that belong to this form rather than to every form: South Carolina's counties, the legacy
 * race/ethnicity codes this record was built against, and its genders. The states and vehicle makes and models it
 * also draws on are national code sets and come from `@forms/value-lists` instead.
 *
 * Every generated module is reached through a `load` callback that imports it dynamically, and must stay that way.
 * A static import of anything under ./generated - including a type-only import that a later edit turns into a
 * value import - folds that list's data straight back into whichever chunk this module lands in, and the split
 * silently stops working.
 */
export const publicContactOrWarningValueLists: ReadonlyArray<IValueListDefinition> = [
    {
        id: PublicContactOrWarningValueListId.county,
        load: () => import("./generated/counties").then(module => toOptions(module.counties))
    },
    {
        id: PublicContactOrWarningValueListId.raceEthnicity,
        load: () => import("./generated/race-ethnicities").then(module => toOptions(module.raceEthnicities))
    },
    {
        // three genders and no code list to generate from, so this one is written out rather than emitted; it
        // still goes through the registry so there is one way a list is reached and not two
        id: PublicContactOrWarningValueListId.gender,
        load: async () => [
            { value: "M", description: "MALE" },
            { value: "F", description: "FEMALE" },
            { value: "U", description: "UNKNOWN" }
        ]
    }
];

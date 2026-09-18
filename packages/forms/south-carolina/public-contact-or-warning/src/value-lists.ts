import { IValueListDefinition, toOptions } from "@forms/value-lists";

/**
 * The ids of the value lists this record owns, prefixed with the form since the registry is a single global
 * namespace and registering replaces whatever already held an id. An unqualified `county` would be claimed by
 * whichever form loaded last, silently showing the wrong counties.
 */
export const PublicContactOrWarningValueListId = {
    county: "sc-432:county",
    gender: "sc-432:gender",
    raceEthnicity: "sc-432:race-ethnicity"
} as const;

/**
 * The value lists this record registers with the value list service.
 *
 * These belong to this form rather than every form: South Carolina's counties, its legacy race/ethnicity codes,
 * and its genders. States, vehicle makes and models come from `@forms/value-lists` instead.
 *
 * Every generated module must stay reached only through a dynamic `load()` -- a static import under ./generated,
 * even a type-only one a later edit turns into a value import, folds that data back into this module's own chunk
 * and silently breaks the split.
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

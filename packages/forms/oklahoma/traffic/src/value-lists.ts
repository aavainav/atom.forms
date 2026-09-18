import { IValueListDefinition, toOptions } from "@forms/value-lists";

/**
 * The ids of the value lists this form owns, prefixed with the form since the registry is a single global
 * namespace and registering replaces whatever already held an id. An unqualified `county` would be claimed by
 * whichever form loaded last, silently showing the wrong counties.
 */
export const OKTrafficValueListId = {
    county: "ok-traffic:county",
    sex: "ok-traffic:sex",
    yesNo: "ok-traffic:yes-no"
} as const;

/**
 * The value lists this form registers with the value list service.
 *
 * These belong to this form rather than every form: Oklahoma's counties, and its two small coded-box answer sets.
 * States, vehicle makes and models come from `@forms/value-lists` instead, as national code sets.
 *
 * Several other printed boxes -- race, ethnicity, vehicle style/colour, offense level, release type, direction of
 * travel, speed detection -- stay text fields until Oklahoma City's code set for each is supplied. Turning one
 * coded is an entry here, a `get*Options` method on the service, and a schema constructor change; nothing else moves.
 *
 * Every generated module must stay reached only through a dynamic `load()` -- a static import under ./generated,
 * even a type-only one a later edit turns into a value import, folds that data back into this module's own chunk
 * and silently breaks the split.
 */
export const okTrafficValueLists: ReadonlyArray<IValueListDefinition> = [
    {
        id: OKTrafficValueListId.county,
        load: () => import("./generated/counties").then(module => toOptions(module.counties))
    },
    {
        // three values and no code list to generate from, so this one is written out rather than emitted; it still
        // goes through the registry so there is one way a list is reached and not two
        id: OKTrafficValueListId.sex,
        load: async () => [
            { value: "M", description: "MALE" },
            { value: "F", description: "FEMALE" },
            { value: "U", description: "UNKNOWN" }
        ]
    },
    {
        // the answer every Y/N box on the form takes; the codes are the letters the form prints in the box
        id: OKTrafficValueListId.yesNo,
        load: async () => [
            { value: "Y", description: "YES" },
            { value: "N", description: "NO" }
        ]
    }
];

import { IValueListDefinition, toOptions } from "@forms/value-lists";

/**
 * The ids of the value lists this form owns.
 *
 * They carry the form as a prefix because the value list registry is a single global namespace and registering a
 * list replaces whatever already held its id. An unqualified `county` would be claimed by whichever form loaded
 * last, and the loser would quietly show the wrong counties rather than fail. `ok-traffic` is the form's route and
 * package name, and stays short in a cache key.
 */
export const OKTrafficValueListId = {
    county: "ok-traffic:county",
    sex: "ok-traffic:sex",
    yesNo: "ok-traffic:yes-no"
} as const;

/**
 * The value lists this form registers with the value list service.
 *
 * These are the lists that belong to this form rather than to every form: Oklahoma's counties, and the two small
 * answer sets its coded boxes take. The states and vehicle makes and models it also draws on are national code
 * sets and come from `@forms/value-lists` instead.
 *
 * The printed form takes a code in several other boxes - race, ethnicity, vehicle style and colour, offense level,
 * release type, direction of travel and speed detection among them - and each is a text field until Oklahoma City's
 * code set for it is supplied. Turning one into a coded box is an entry here, a `get*Options` method on the
 * service, and a change of constructor in the schema; nothing else moves.
 *
 * Every generated module is reached through a `load` callback that imports it dynamically, and must stay that way.
 * A static import of anything under ./generated - including a type-only import that a later edit turns into a
 * value import - folds that list's data straight back into whichever chunk this module lands in, and the split
 * silently stops working.
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

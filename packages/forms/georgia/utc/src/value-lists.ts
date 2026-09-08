import { IValueListDefinition } from "@forms/value-lists";

/**
 * The ids of the value lists this form owns.
 *
 * They carry the form as a prefix because the value list registry is a single global namespace and registering a
 * list replaces whatever already held its id. An unqualified `county` would be claimed by whichever form loaded
 * last, and the loser would quietly show the wrong counties rather than fail. `ga-utc` is the form's route and
 * package name, and stays short in a cache key.
 */
export const GAUTCValueListId = {
    county: "ga-utc:county",
    sex: "ga-utc:sex"
} as const;

/**
 * The value lists this form registers with the value list service.
 *
 * Both are written out rather than generated: neither has a published code set to generate from, and the counties
 * are the three the citation prints beside the box rather than Georgia's 159. They still go through the registry so
 * that there is one way a list is reached and not two, and so a host serving Atlanta's jurisdiction from its own
 * source can register over either id.
 *
 * Almost every other answer the citation takes is a printed checkbox rather than a coded box, and is modelled as a
 * boolean field. Race, hair and eye colour take a write-in code on paper, but Atlanta publishes no code set for
 * them, so each is a text field until one is supplied; turning one into a coded box is an entry here, a
 * `get*Options` method on the service, and a change of constructor in the schema.
 */
export const gaUtcValueLists: ReadonlyArray<IValueListDefinition> = [
    {
        // the citation prints these three beside the box and no others, so the list is the printed one rather than
        // every county in Georgia
        id: GAUTCValueListId.county,
        load: async () => [
            { value: "FULTON", description: "FULTON" },
            { value: "DEKALB", description: "DEKALB" },
            { value: "CLAYTON", description: "CLAYTON" }
        ]
    },
    {
        // the citation prints race and sex as one slashed box; the form holds them as two fields, and this is the
        // sex half of it
        id: GAUTCValueListId.sex,
        load: async () => [
            { value: "M", description: "MALE" },
            { value: "F", description: "FEMALE" },
            { value: "U", description: "UNKNOWN" }
        ]
    }
];

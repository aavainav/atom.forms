import { IValueListDefinition } from "@forms/value-lists";

/**
 * The ids of the value lists this form owns, prefixed with the form since the registry is a single global
 * namespace and registering replaces whatever already held an id. An unqualified `county` would be claimed by
 * whichever form loaded last, silently showing the wrong counties.
 */
export const GAUTCValueListId = {
    county: "ga-utc:county",
    sex: "ga-utc:sex"
} as const;

/**
 * The value lists this form registers with the value list service.
 *
 * Both are written out rather than generated, since neither has a published code set, and the counties are the
 * three the citation prints rather than Georgia's 159. They still go through the registry so there's one way a
 * list is reached, letting a host serving Atlanta's jurisdiction register over either id.
 *
 * Race, hair and eye colour take a write-in code on paper with no published code set, so each stays a text field
 * until one is supplied -- turning one into a coded box is an entry here, a `get*Options` method on the service,
 * and a constructor change in the schema.
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

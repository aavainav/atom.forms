import { IViolationListDefinition } from "@forms/violations";

/** The ids of the violation lists this form owns, prefixed with the form so nothing else can claim them. */
export const GAUTCValueViolationListId = {
    violation: "ga-utc:violation"
} as const;

/**
 * The violations a Georgia UTC can be written for.
 *
 * Written inline rather than generated, as this form's value lists are: Atlanta publishes no machine-readable
 * offence code list with the citation, so this is the handful of Title 40 sections the ticket is most often
 * written under and needs checking against the current Code. An agency serving its own list registers over
 * `ga-utc:violation`, which replaces this outright.
 */
export const gaUtcViolationLists: ReadonlyArray<IViolationListDefinition> = [
    {
        id: GAUTCValueViolationListId.violation,
        load: async () => [
            { code: "40-6-181", statute: "40-6-181", description: "Speeding", points: 0 },
            { code: "40-6-20", statute: "40-6-20", description: "Failure to obey a traffic control device", points: 3 },
            { code: "40-6-21", statute: "40-6-21", description: "Running a red light", points: 3 },
            { code: "40-6-49", statute: "40-6-49", description: "Following too closely", points: 3 },
            { code: "40-6-391", statute: "40-6-391", description: "Driving under the influence", points: 0, requiresCourtAppearance: true },
            { code: "40-5-20", statute: "40-5-20", description: "Driving without a licence", points: 0, requiresCourtAppearance: true },
            { code: "40-5-121", statute: "40-5-121", description: "Driving while licence suspended", points: 0, requiresCourtAppearance: true },
            { code: "40-6-241", statute: "40-6-241", description: "Distracted driving", points: 1 },
            { code: "40-8-76.1", statute: "40-8-76.1", description: "Failure to wear a seat belt", points: 0 },
            { code: "40-6-10", statute: "40-6-10", description: "Operating a vehicle without insurance", points: 0, requiresCourtAppearance: true }
        ]
    }
];

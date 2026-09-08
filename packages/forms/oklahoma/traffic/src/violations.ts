import { IViolationListDefinition } from "@forms/violations";

/** The ids of the violation lists this form owns, prefixed with the form so nothing else can claim them. */
export const OKTrafficViolationListId = {
    violation: "ok-traffic:violation"
} as const;

/**
 * The violations an OKC traffic citation can be written for.
 *
 * Written inline rather than generated: Oklahoma City publishes no machine-readable offence code list with the
 * citation, so these are the traffic code sections the ticket is most often written under and both the codes and
 * the scheduled fines need checking against the current municipal code. An agency serving its own list registers
 * over `ok-traffic:violation`, which replaces this outright.
 */
export const okTrafficViolationLists: ReadonlyArray<IViolationListDefinition> = [
    {
        id: OKTrafficViolationListId.violation,
        load: async () => [
            { code: "32-51", statute: "32-51", description: "Speeding", fine: 172, isLocalOrdinance: true },
            { code: "32-56", statute: "32-56", description: "Failure to stop at a stop sign", fine: 172, isLocalOrdinance: true },
            { code: "32-57", statute: "32-57", description: "Running a red light", fine: 172, isLocalOrdinance: true },
            { code: "32-62", statute: "32-62", description: "Following too closely", fine: 172, isLocalOrdinance: true },
            { code: "32-70", statute: "32-70", description: "Failure to yield the right of way", fine: 172, isLocalOrdinance: true },
            { code: "32-101", statute: "32-101", description: "Driving under the influence", isLocalOrdinance: true, requiresCourtAppearance: true },
            { code: "32-120", statute: "32-120", description: "Driving without a valid licence", fine: 222, isLocalOrdinance: true },
            { code: "32-125", statute: "32-125", description: "Driving without insurance", fine: 272, isLocalOrdinance: true, requiresCourtAppearance: true },
            { code: "32-140", statute: "32-140", description: "Failure to wear a seat belt", fine: 20, isLocalOrdinance: true },
            { code: "32-160", statute: "32-160", description: "Careless driving", fine: 222, isLocalOrdinance: true }
        ]
    }
];

import { IViolationListDefinition } from "@forms/violations";

/** The ids of the violation lists this form owns, prefixed with the form so nothing else can claim them. */
export const OKParkingViolationListId = {
    violation: "ok-parking:violation"
} as const;

/**
 * The parking violations an OKC citation can be written for. Written inline, since Oklahoma City publishes no
 * machine-readable parking code list -- these are the chapter 32 sections most often written under, worth
 * checking against the current municipal code. An agency serving its own list registers over
 * `ok-parking:violation`, replacing this outright.
 */
export const okParkingViolationLists: ReadonlyArray<IViolationListDefinition> = [
    {
        id: OKParkingViolationListId.violation,
        load: async () => [
            { code: "32-201", category: "Prohibited zone", statute: "32-201", description: "Parking in a prohibited zone", fine: 25, isLocalOrdinance: true },
            { code: "32-202", category: "Metered parking", statute: "32-202", description: "Overtime parking at a metered space", fine: 20, isLocalOrdinance: true },
            { code: "32-203", category: "Safety hazard", statute: "32-203", description: "Parking in a fire lane", fine: 50, isLocalOrdinance: true },
            { code: "32-204", category: "Safety hazard", statute: "32-204", description: "Parking within 15 feet of a fire hydrant", fine: 50, isLocalOrdinance: true },
            { code: "32-205", category: "Accessible parking", statute: "32-205", description: "Parking in a disabled space without a permit", fine: 200, isLocalOrdinance: true },
            { code: "32-206", category: "Obstruction", statute: "32-206", description: "Blocking a driveway", fine: 35, isLocalOrdinance: true },
            { code: "32-207", category: "Obstruction", statute: "32-207", description: "Parking on a sidewalk", fine: 35, isLocalOrdinance: true },
            { code: "32-208", category: "Obstruction", statute: "32-208", description: "Double parking", fine: 35, isLocalOrdinance: true },
            { code: "32-209", category: "Prohibited zone", statute: "32-209", description: "Parking against the flow of traffic", fine: 25, isLocalOrdinance: true },
            { code: "32-210", category: "Prohibited zone", statute: "32-210", description: "Parking in a loading zone", fine: 30, isLocalOrdinance: true }
        ]
    }
];

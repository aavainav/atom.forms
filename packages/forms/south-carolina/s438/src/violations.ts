import { IViolationListDefinition, toViolations } from "@forms/violations";

/** The ids of the violation lists this form owns, prefixed with the form so nothing else can claim them. */
export const S438ViolationListId = {
    violation: "sc-s438:violation"
} as const;

export const s438ViolationLists: ReadonlyArray<IViolationListDefinition> = [
    {
        id: S438ViolationListId.violation,
        load: () => import("./generated/violations").then(module => toViolations(module.violations))
    }
];

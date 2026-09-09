import { IControllerManager } from "@forms/core";

import { IViolation } from "./violation";

/** Describes how a form takes the violations chosen in the selector. */
export interface IViolationBinding {
    /** The id of the violation list this form draws its charges from. */
    readonly listId: string;
    /** The name of the page definition carrying one violation, which repeats once per violation beyond the first. */
    readonly pageName: string;

    /** Applies the chosen violations to the form, adding a page per violation beyond the first. */
    apply: (controllers: IControllerManager, violations: ReadonlyArray<IViolation>) => Promise<void>;

    /**
     * Narrows the given violations to those the form is already carrying.
     *
     * It takes the loaded list and answers with a subset of it rather than returning bare codes, so the selector
     * never has to match a stored string back to a row itself.
     */
    getApplied: (controllers: IControllerManager, violations: ReadonlyArray<IViolation>) => ReadonlyArray<IViolation>;
}

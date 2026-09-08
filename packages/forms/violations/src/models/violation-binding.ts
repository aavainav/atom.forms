import { IControllerManager } from "@forms/core";

import { IViolation } from "./violation";

/**
 * Describes how a form takes the violations chosen in the picker.
 *
 * Every citation prints exactly one charge, but not in the same place or under the same name: the S438 writes its
 * `violation-section`, the Georgia UTC writes its `offense-section` -- its own `violation-section` is the speed
 * detection gear -- and the two Oklahoma forms split the charge across a violation section and a section carrying
 * the money. So the picker never writes a field itself; it hands the chosen violations to the form, which owns
 * both where they land and how a second violation becomes a second page.
 */
export interface IViolationBinding {
    /** The id of the violation list this form draws its charges from. */
    readonly listId: string;
    /** The name of the page definition carrying one violation, which repeats once per violation beyond the first. */
    readonly pageName: string;

    /** Applies the chosen violations to the form, adding a page per violation beyond the first. */
    apply: (controllers: IControllerManager, violations: ReadonlyArray<IViolation>) => Promise<void>;
}

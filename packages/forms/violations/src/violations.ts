import { IViolationListDefinition } from "./models";

/**
 * The ids of the violation lists this package bundles.
 *
 * A violation code list belongs to a jurisdiction, with no national one -- unlike `@forms/value-lists`, this
 * package bundles nothing unqualified, so every id names its owner and a form-specific list is prefixed by that
 * form, preventing two jurisdictions from colliding on one id.
 */
export const ViolationListId = {
} as const;

/**
 * The violation lists this module registers before any form module configures.
 *
 * There are none today, deliberately -- a code list is published by the agency writing the citations, and
 * inventing one here would look sourced when it isn't. A form-specific list belongs in that form's own package;
 * an agency serving its own list registers over the id.
 */
export const standardViolationLists: ReadonlyArray<IViolationListDefinition> = [
];

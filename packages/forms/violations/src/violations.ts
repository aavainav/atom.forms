import { IViolationListDefinition } from "./models";

/**
 * The ids of the violation lists this package bundles.
 *
 * A violation code list belongs to a jurisdiction, and there is no national one, so unlike `@forms/value-lists`
 * this package bundles nothing unqualified: every id names its owner. A list belonging to one form carries that
 * form as its prefix, so two jurisdictions cannot claim the same id and leave whichever loaded last quietly
 * offering the wrong charges.
 */
export const ViolationListId = {
} as const;

/**
 * The violation lists registered by this module before any form module configures.
 *
 * There are none today, and that is deliberate rather than unfinished: a violation code list is published by the
 * agency that writes the citations, and inventing one here would produce a `data/*.json` that reads as though it
 * came from a source. A list belonging to one form is declared in that form's own package, and an agency serving
 * its own list registers over the id.
 */
export const standardViolationLists: ReadonlyArray<IViolationListDefinition> = [
];

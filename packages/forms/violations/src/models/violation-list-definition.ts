import { IViolation } from "./violation";

/** Describes a violation list: how it is identified, and how the violations in it are loaded. */
export interface IViolationListDefinition {
    /**
     * Identifies the list. Registering a second definition under an id already in use replaces the first, which is
     * how an agency serves its own current code list in place of the one bundled here.
     *
     * Ids are namespaced by owner, as value list ids are: a list belonging to one form carries that form as a
     * prefix (`sc-s438:violation`), so two jurisdictions' code lists cannot claim the same id and quietly leave
     * whichever loaded last showing the wrong charges.
     */
    readonly id: string;

    /** Loads every violation in the list. */
    load: () => Promise<ReadonlyArray<IViolation>>;
}

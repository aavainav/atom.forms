import { IViolation } from "./violation";

/** Describes a violation list: how it is identified, and how the violations in it are loaded. */
export interface IViolationListDefinition {
    /**
     * Identifies the list. Registering under an id already in use replaces it, which is how an agency serves its
     * own current code list in place of the one bundled here.
     *
     * Namespaced by owner, like value list ids: a form-specific list is prefixed by that form
     * (`sc-s438:violation`), preventing two jurisdictions from colliding on one id.
     */
    readonly id: string;

    /** Loads every violation in the list. */
    load: () => Promise<ReadonlyArray<IViolation>>;
}

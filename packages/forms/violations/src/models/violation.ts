/**
 * Represents one violation a citation can be written for.
 *
 * The shape is the union of what the citation forms print, and everything but the code and the description is
 * optional, because no jurisdiction publishes all of it: South Carolina prints points beside the charge and no
 * fine, Oklahoma City prints a scheduled fine and no points, and Georgia prints neither. A form takes what it has
 * a box for and leaves the rest.
 */
export interface IViolation {
    /** The agency's own code for the violation, as the citation prints it. */
    readonly code: string;
    /** The violation as it reads on the citation. */
    readonly description: string;

    /** The scheduled fine, where the jurisdiction publishes one. */
    readonly fine?: number;
    /** Whether the violation is a local ordinance rather than state law. */
    readonly isLocalOrdinance?: boolean;
    /** The licence points the violation carries. */
    readonly points?: number;
    /** Whether the person cited must appear in court rather than paying the fine. */
    readonly requiresCourtAppearance?: boolean;
    /** The statute or ordinance section number, where the citation prints one separately from the code. */
    readonly statute?: string;
}

/**
 * The compact row a generated violation list is emitted as.
 *
 * Spelling an violation out in full costs several times what the data in it is worth once a list runs to a few
 * thousand rows, so a generated list is emitted as tuples and expanded by `toViolations` when it loads. The
 * trailing fields are positional, and a row carrying none of them is just a code and a description.
 */
export type ViolationRow = readonly [
    code: string,
    description: string,
    statute?: string,
    fine?: number,
    points?: number,
    isLocalOrdinance?: boolean,
    requiresCourtAppearance?: boolean
];

/** Expands the rows a generated violation list is emitted as into violations. */
export function toViolations(rows: ReadonlyArray<ViolationRow>): Array<IViolation> {
    return rows.map(([code, description, statute, fine, points, isLocalOrdinance, requiresCourtAppearance]) => {
        const violation: Record<string, unknown> = { code, description };

        // an absent field is left off rather than written as undefined, so a form asking whether the violation
        // carries a fine gets the same answer from a generated row and a hand-registered one
        if (statute !== undefined) { violation.statute = statute; }
        if (fine !== undefined) { violation.fine = fine; }
        if (points !== undefined) { violation.points = points; }
        if (isLocalOrdinance !== undefined) { violation.isLocalOrdinance = isLocalOrdinance; }
        if (requiresCourtAppearance !== undefined) { violation.requiresCourtAppearance = requiresCourtAppearance; }

        return violation as unknown as IViolation;
    });
}

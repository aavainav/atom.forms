/** Represents one violation a citation can be written for. */
export interface IViolation {
    /** The agency's own code for the violation, as the citation prints it. */
    readonly code: string;
    /** The violation as it reads on the citation. */
    readonly description: string;

    /**
     * The group the code list files the violation under, e.g. "Speed" or "Licence & registration".
     *
     * Free text, not an enum: the grouping belongs to the publishing agency, and jurisdictions divide codes
     * differently. A list with none simply isn't filterable by category, which is why the selector only offers
     * the control once a list turns out to have them.
     */
    readonly category?: string;

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
 * Fields are ordered by how often they're filled in, not by importance -- a row trims to its last present field,
 * and a gap before that needs an `undefined` placeholder. Category sits third since nearly every categorised row
 * carries one; placing it later would cost extra placeholders on most rows.
 */
export type ViolationRow = readonly [
    code: string,
    description: string,
    category?: string,
    statute?: string,
    fine?: number,
    points?: number,
    isLocalOrdinance?: boolean,
    requiresCourtAppearance?: boolean
];

/** Expands the rows a generated violation list is emitted as into violations. */
export function toViolations(rows: ReadonlyArray<ViolationRow>): Array<IViolation> {
    return rows.map(([code, description, category, statute, fine, points, isLocalOrdinance, requiresCourtAppearance]) => {
        const violation: Record<string, unknown> = { code, description };

        // an absent field is left off rather than written as undefined, so a form asking whether the violation
        // carries a fine gets the same answer from a generated row and a hand-registered one
        if (category !== undefined) { violation.category = category; }
        if (statute !== undefined) { violation.statute = statute; }
        if (fine !== undefined) { violation.fine = fine; }
        if (points !== undefined) { violation.points = points; }
        if (isLocalOrdinance !== undefined) { violation.isLocalOrdinance = isLocalOrdinance; }
        if (requiresCourtAppearance !== undefined) { violation.requiresCourtAppearance = requiresCourtAppearance; }

        return violation as unknown as IViolation;
    });
}

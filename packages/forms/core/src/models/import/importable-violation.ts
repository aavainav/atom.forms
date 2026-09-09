import { z } from "zod";

export const schema = z.object({
    code: z.string().min(1).max(50),
    description: z.string().min(1).max(500),
    statute: z.string().max(50).optional(),
    fine: z.number().min(0).optional(),
    points: z.number().min(0).optional(),
    isLocalOrdinance: z.boolean().optional(),
    requiresCourtAppearance: z.boolean().optional()
});

export type ImportableViolation = z.infer<typeof schema>;

/**
 * Describes a violation's data as it arrives from an import source.
 *
 * Everything but the code and the description is optional because no jurisdiction publishes all of it, and a form
 * takes only what it has a box for; the shape mirrors `IViolation` in `@forms/violations`, which is where the
 * violations a selector offers come from.
 */
export interface IImportableViolation {
    /** The agency's own code for the violation. */
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
    /** The statute or ordinance section number. */
    readonly statute?: string;
}

export function validateImportableViolation(data: ImportableViolation): ImportableViolation {
    const result = schema.safeParse(data);
    if (!result.success) {
        throw new Error(`Invalid ImportableViolation data: ${result.error.message}`);
    }

    return result.data;
}

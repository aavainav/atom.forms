import { z } from "zod";

export const schema = z.object({
    firstName: z.string().min(2).max(100),
    middleName: z.string().min(2).max(100).optional(),
    lastName: z.string().min(2).max(100),
    address: z.string().min(5).max(200).optional(),
    city: z.string().min(2).max(100).optional(),
    state: z.string().min(2).max(100).optional(),
    zipCode: z.string().min(5).max(20).optional(),
});

export type ImportablePerson = z.infer<typeof schema>;

/** Describes a person's data as it arrives from an import source. */
export interface IImportablePerson {
    /** The person's first name. */
    readonly firstName: string;
    /** The person's middle name. */
    readonly middleName?: string;
    /** The person's last name. */
    readonly lastName: string;
    /** The person's street address. */
    readonly address?: string;
    /** The person's city. */
    readonly city?: string;
    /** The person's state. */
    readonly state?: string;
    /** The person's zip code. */
    readonly zipCode?: string;
}

export function validateImportablePerson(data: ImportablePerson): ImportablePerson {
    const result = schema.safeParse(data);
    if (!result.success) {
        throw new Error(`Invalid ImportablePerson data: ${result.error.message}`);
    }

    return result.data;
}

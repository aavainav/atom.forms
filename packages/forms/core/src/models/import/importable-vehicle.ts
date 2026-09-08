import { z } from "zod";

export const schema = z.object({
    make: z.string().min(1).max(100),
    model: z.string().min(1).max(100),
    year: z.number().min(1886).max(new Date().getFullYear() + 1)
});

export type ImportableVehicle = z.infer<typeof schema>;

/** Describes a vehicle's data as it arrives from an import source. */
export interface IImportableVehicle {
    /** The vehicle's make. */
    readonly make: string;
    /** The vehicle's model. */
    readonly model: string;
    /** The vehicle's model year. */
    readonly year: number;
}

export function validateImportableVehicle(data: ImportableVehicle): ImportableVehicle {
    const result = schema.safeParse(data);
    if (!result.success) {
        throw new Error(`Invalid ImportableVehicle data: ${result.error.message}`);
    }

    return result.data;
}

import { z } from "zod";

import { createParser } from "@common/zod";
import { createService, Singleton } from "@shrub/core";

export const ILocalStorageService = createService<ILocalStorageService>("report-viewer-local-storage-service");

/** A generic key/value store, validated against a schema on the way in and out. */
export interface ILocalStorageService {
    /** Reads the value stored under the given key. Returns undefined if nothing is stored, or if what's stored doesn't match the schema -- corrupted or stale data is treated the same as absent, never thrown. */
    read<T>(key: string, schema: z.ZodType<T>): Promise<T | undefined>;
    /** Validates the value against the schema and stores it under the given key, overwriting whatever was there before. Throws if the value doesn't match -- a caller passing the wrong shape is a bug, not something to swallow. */
    write<T>(key: string, value: T, schema: z.ZodType<T>): Promise<void>;
}

/** Reads and writes values through the browser's localStorage. */
@Singleton
export class LocalStorageService implements ILocalStorageService {
    async read<T>(key: string, schema: z.ZodType<T>): Promise<T | undefined> {
        const raw = localStorage.getItem(key);
        if (raw === null) {
            return undefined;
        }

        try {
            const result = createParser(schema).parse(raw);
            return result.success ? result.data : undefined;
        } catch {
            // raw isn't even valid JSON -- treated the same as nothing being stored
            return undefined;
        }
    }

    async write<T>(key: string, value: T, schema: z.ZodType<T>): Promise<void> {
        const result = schema.safeParse(value);
        if (!result.success) {
            throw new Error(`Invalid value for key "${key}": ${result.error.message}`);
        }

        localStorage.setItem(key, JSON.stringify(result.data));
    }
}

import { createService, Singleton } from "@shrub/core";

export const ILocalStorageService = createService<ILocalStorageService>("report-viewer-local-storage-service");

/** A generic key/value store. */
export interface ILocalStorageService {
    /** Reads the value stored under the given key, or undefined if nothing has been stored yet. */
    read<T>(key: string): Promise<T | undefined>;
    /** Stores a value under the given key, overwriting whatever was there before. */
    write<T>(key: string, value: T): Promise<void>;
}

/** Reads and writes values through the browser's localStorage. */
@Singleton
export class LocalStorageService implements ILocalStorageService {
    async read<T>(key: string): Promise<T | undefined> {
        const raw = localStorage.getItem(key);
        return raw === null ? undefined : JSON.parse(raw) as T;
    }

    async write<T>(key: string, value: T): Promise<void> {
        localStorage.setItem(key, JSON.stringify(value));
    }
}

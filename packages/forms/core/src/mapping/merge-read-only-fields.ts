import { ReadOnlyFields } from "./form-mapper";

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Lays `next` over `base` so that a field marked in either stays marked. Lists of pages are laid over by position. */
function lay(base: unknown, next: unknown): unknown {
    if (Array.isArray(base) && Array.isArray(next)) {
        return Array.from({ length: Math.max(base.length, next.length) }, (_, index) => lay(base[index], next[index]));
    }

    if (isObject(base) && isObject(next)) {
        return Object.fromEntries([...new Set([...Object.keys(base), ...Object.keys(next)])].map(key => [key, lay(base[key], next[key])]));
    }

    return next || base || next;
}

/** Lays one set of locked fields over another, so that a field either marks stays marked. */
export function mergeReadOnlyFields<TData>(base: ReadOnlyFields<TData> | undefined, next: ReadOnlyFields<TData>): ReadOnlyFields<TData> {
    return lay(base ?? {}, next) as ReadOnlyFields<TData>;
}

/** Whether a value is a record to walk key by key. An option box's `{ value, description }` pair is one field, not two. */
export function isRecord(value: unknown): value is Record<string, unknown> {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
        return false;
    }

    const keys = Object.keys(value);

    return !(keys.length === 2 && keys.includes("value") && keys.includes("description"));
}

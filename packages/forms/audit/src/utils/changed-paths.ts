import { isRecord } from "@forms/core";

function collect(before: unknown, after: unknown, path: string, paths: Array<string>): void {
    if (isRecord(before) && isRecord(after)) {
        for (const key of [...new Set([...Object.keys(before), ...Object.keys(after)])].sort()) {
            collect(before[key], after[key], path ? `${path}.${key}` : key, paths);
        }

        return;
    }

    // records in an array compare by position; an array of plain values is one value
    if (Array.isArray(before) && Array.isArray(after) && (before.some(isRecord) || after.some(isRecord))) {
        // when the length changed a record was added or removed, and which of the others moved up or down cannot be told
        // from an edit, so only the positions past the shorter side are reported
        const start = before.length === after.length ? 0 : Math.min(before.length, after.length);

        for (let index = start; index < Math.max(before.length, after.length); index++) {
            collect(before[index], after[index], `${path}[${index}]`, paths);
        }

        return;
    }

    if (path && JSON.stringify(before) !== JSON.stringify(after)) {
        paths.push(path);
    }
}

/** Finds the data-contract paths that differ between two extracts, such as `violatorSex` or `additionalViolations[1].violationDescription`. Paths only, never values. */
export function getChangedPaths(before: unknown, after: unknown): Array<string> {
    const paths: Array<string> = [];
    collect(before, after, "", paths);

    return paths;
}

import { IPresetSkip } from "@forms/audit";
import { isRecord, IReportData, ReadOnlyFields } from "@forms/core";

import { isAnswered } from "./is-answered";
import { IReportPreset } from "../services";

/** The pages a preset would add to one list of pages. */
export interface IPagesAdded {
    readonly added: number;
    readonly list: string;
}

/** What applying a preset to the report as it stands comes to. */
export interface IPresetPlan {
    /** What is left of the preset's data, in the same shape. */
    readonly data: Record<string, unknown>;
    /** The paths `data` would set. */
    readonly fields: ReadonlyArray<string>;
    /** The pages the preset would add. */
    readonly pages: ReadonlyArray<IPagesAdded>;
    /** The preset's locks cut down to what is still in `data`, so only a lock actually applied is remembered. */
    readonly readOnlyFields?: ReadOnlyFields<IReportData>;
    /** What the preset carried and left alone, and why. */
    readonly skipped: ReadonlyArray<IPresetSkip>;
}

interface IContext {
    readonly overwrite: boolean;
    readonly pages: Array<IPagesAdded>;
    readonly skipped: Array<IPresetSkip>;
    readonly written: Array<string>;
}

/** What locks a field inside a record or a page: the mark of its own, or the one on the whole of what holds it. */
function getLock(locked: unknown, key: string | number): unknown {
    if (locked === true) {
        return true;
    }

    if (typeof key === "number") {
        return Array.isArray(locked) ? locked[key] : undefined;
    }

    return isRecord(locked) ? locked[key] : undefined;
}

/** Cuts what the preset wants down to what may be written, noting what it leaves alone and what it sets. */
function cut(wanted: unknown, current: unknown, locked: unknown, path: string, context: IContext): unknown {
    if (isRecord(wanted)) {
        const kept: Record<string, unknown> = {};

        for (const [key, value] of Object.entries(wanted)) {
            const left = cut(value, isRecord(current) ? current[key] : undefined, getLock(locked, key), path ? `${path}.${key}` : key, context);

            if (left !== undefined) {
                kept[key] = left;
            }
        }

        return Object.keys(kept).length > 0 ? kept : undefined;
    }

    if (Array.isArray(wanted) && wanted.some(isRecord)) {
        // pages pair by position, and one with nothing to write keeps its place as an empty record
        const have = Array.isArray(current) ? current.length : 0;
        const items = wanted.map((item, index) => cut(item, Array.isArray(current) ? current[index] : undefined, getLock(locked, index), `${path}[${index}]`, context) ?? {});

        if (wanted.length > have) {
            context.pages.push({ added: wanted.length - have, list: path });
        }

        return wanted.length > have || items.some(item => isRecord(item) && Object.keys(item).length > 0) ? items : undefined;
    }

    // one value: a field, an option box's pair, or a list of plain values. already what the preset sets is nothing to do
    if (JSON.stringify(wanted) === JSON.stringify(current)) {
        return undefined;
    }

    if (locked) {
        context.skipped.push({ field: path, reason: "locked" });
        return undefined;
    }

    if (!context.overwrite && isAnswered(current)) {
        context.skipped.push({ field: path, reason: "answered" });
        return undefined;
    }

    context.written.push(path);

    return wanted;
}

/** Cuts the locks down to the fields still there to lock. */
function cutLocks(locks: unknown, kept: unknown): unknown {
    if (kept === undefined) {
        return undefined;
    }

    if (isRecord(locks) && isRecord(kept)) {
        const cutDown: Record<string, unknown> = {};

        for (const [key, lock] of Object.entries(locks)) {
            const inner = cutLocks(lock, kept[key]);

            if (inner !== undefined) {
                cutDown[key] = inner;
            }
        }

        return Object.keys(cutDown).length > 0 ? cutDown : undefined;
    }

    if (Array.isArray(locks) && Array.isArray(kept)) {
        const cutDown = locks.map((lock, index) => cutLocks(lock, kept[index]));
        return cutDown.some(lock => lock !== undefined) ? cutDown : undefined;
    }

    return locks || undefined;
}

/**
 * Works out what applying the preset to the report would do. A field the host locked is never written, and one the
 * report already answers is not unless told to overwrite. One already holding what the preset sets is neither.
 */
export function planPreset(preset: IReportPreset, current: IReportData, locked: ReadOnlyFields<IReportData> | undefined, overwrite: boolean): IPresetPlan {
    const context: IContext = { overwrite, pages: [], skipped: [], written: [] };
    const cutDown = cut(preset.data, current, locked, "", context);
    const data = isRecord(cutDown) ? cutDown : {};

    return { data, fields: context.written, pages: context.pages, readOnlyFields: cutLocks(preset.readOnlyFields, data) as ReadOnlyFields<IReportData> | undefined, skipped: context.skipped };
}

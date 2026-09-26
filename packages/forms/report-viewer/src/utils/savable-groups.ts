import { isRecord, IReportData, ReadOnlyFields } from "@forms/core";

import { isAnswered } from "./is-answered";

/** One field a preset could be saved from, with the value it holds now, which is the officer's own to see. */
export interface ISavableField {
    readonly key: string;
    readonly value: unknown;
}

/** The answered fields in one place on the report: the report itself, or one page of a list of pages. */
export interface ISavableGroup {
    readonly fields: ReadonlyArray<ISavableField>;
    /** The page's position in its list, counting from zero. Absent for the report itself. */
    readonly index?: number;
    /** The list the page is in, such as `persons`. Absent for the report itself. */
    readonly list?: string;
}

/** A list of pages the report has, and how many pages it holds. */
export interface IPageList {
    readonly count: number;
    readonly list: string;
}

const identityKeys: ReadonlySet<string> = new Set(["id", "name", "revision", "status", "type", "version", "workflow"]);

/** Matches a path into a page, such as `persons[1].nonMotoristUnitType`. */
const pagePath = /^(\w+)\[(\d+)\]\.(\w+)$/;

function isList(value: unknown): value is ReadonlyArray<unknown> {
    return Array.isArray(value) && value.some(isRecord);
}

/** The answered, unlocked single fields of a record. A value that is itself a record, or a list of them, is not one. */
function toFields(record: Record<string, unknown>, locks: Record<string, unknown>): ReadonlyArray<ISavableField> {
    return Object.entries(record)
        .filter(([key, value]) => isAnswered(value) && !locks[key] && !isRecord(value) && !isList(value))
        .map(([key, value]) => ({ key, value }));
}

/** What a preset could be saved from, grouped by where it sits: answered, not locked, and not the report's own identity. */
export function getSavableGroups(current: IReportData, locked: ReadOnlyFields<IReportData> | undefined): ReadonlyArray<ISavableGroup> {
    const locks: Record<string, unknown> = isRecord(locked) ? locked : {};
    const own = toFields(Object.fromEntries(Object.entries(current).filter(([key]) => !identityKeys.has(key))), locks);
    const pages: Array<ISavableGroup> = [];

    for (const [list, value] of Object.entries(current)) {
        if (!isList(value)) {
            continue;
        }

        const listLocks = locks[list];

        value.forEach((page, index) => {
            const pageLocks = Array.isArray(listLocks) ? listLocks[index] : undefined;

            // a mark on the whole list, or on the whole page, closes every field on it
            if (!isRecord(page) || listLocks === true || pageLocks === true) {
                return;
            }

            pages.push({ fields: toFields(page, isRecord(pageLocks) ? pageLocks : {}), index, list });
        });
    }

    return [{ fields: own }, ...pages].filter(group => group.fields.length > 0);
}

/** The lists of pages the report has, so a preset can keep the number of pages of one. */
export function getPageLists(current: IReportData): ReadonlyArray<IPageList> {
    const lists: Array<IPageList> = [];

    for (const [list, value] of Object.entries(current)) {
        if (isList(value)) {
            lists.push({ count: value.length, list });
        }
    }

    return lists;
}

/** Builds a preset's data from what was ticked, by path such as `agencyName` or `persons[1].nonMotoristUnitType`. `pageCounts` are lists to keep the number of pages of, blank. */
export function toPresetData(current: IReportData, selected: ReadonlySet<string>, pageCounts: ReadonlySet<string>): Record<string, unknown> {
    const data: Record<string, unknown> = {};
    const lists = new Map<string, Array<Record<string, unknown>>>();

    const pagesOf = (list: string): Array<Record<string, unknown>> => {
        const pages = lists.get(list) ?? [];
        lists.set(list, pages);

        return pages;
    };

    for (const path of selected) {
        const match = pagePath.exec(path);

        if (!match) {
            data[path] = current[path];
            continue;
        }

        const [, list, position, key] = match;
        const index = Number(position);
        const source = current[list];
        const page = Array.isArray(source) ? source[index] : undefined;
        const pages = pagesOf(list);

        // positions before this one are held by empty records, so the page lands where it was
        while (pages.length <= index) {
            pages.push({});
        }

        pages[index][key] = isRecord(page) ? page[key] : undefined;
    }

    for (const list of pageCounts) {
        const source = current[list];
        const pages = pagesOf(list);

        while (pages.length < (Array.isArray(source) ? source.length : 0)) {
            pages.push({});
        }
    }

    for (const [list, pages] of lists) {
        data[list] = pages;
    }

    return data;
}

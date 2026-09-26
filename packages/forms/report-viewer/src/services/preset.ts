import { getAuditController, IPresetSkip } from "@forms/audit";
import { isRecord, IControllerManager, IReportData, ReadOnlyFields } from "@forms/core";
import { createService, Singleton } from "@shrub/core";

import { IReportPreset, IReportViewerDataManager } from "./report-viewer";

export const IPresetService = createService<IPresetService>("report-viewer-preset-service");

/** A list of pages the report has, and how many pages it holds. */
export interface IPageList {
    readonly count: number;
    /** The list's name for the officer, such as "Persons". */
    readonly label: string;
    /** The list's name in the report's data, such as `persons`. */
    readonly list: string;
}

/** The pages a preset would add to one list of pages. */
export interface IPagesAdded {
    readonly added: number;
    /** The list's name for the officer, such as "Persons". */
    readonly label: string;
    /** The list's name in the report's data, such as `persons`. */
    readonly list: string;
}

/** The fields a preset would set on one page, or on the report itself. */
export interface IPlannedGroup {
    /** The paths of the fields, such as `agencyCity` or `persons[1].first`. */
    readonly fields: ReadonlyArray<string>;
    /** Where the fields sit, for the officer, such as "Persons, page 2". Absent for the report's own. */
    readonly title?: string;
}

/** What applying a preset to the report as it stands comes to. */
export interface IPresetPlan {
    /** What is left of the preset's data, in the same shape. */
    readonly data: Record<string, unknown>;
    /** The paths `data` would set. */
    readonly fields: ReadonlyArray<string>;
    /** The same paths, sorted under the page they sit on, the report's own first. */
    readonly groups: ReadonlyArray<IPlannedGroup>;
    /** The pages the preset would add. */
    readonly pages: ReadonlyArray<IPagesAdded>;
    /** The preset's locks cut down to what is still in `data`, so only a lock actually applied is remembered. */
    readonly readOnlyFields?: ReadOnlyFields<IReportData>;
    /** What the preset carried and left alone, and why. */
    readonly skipped: ReadonlyArray<IPresetSkip>;
}

/** One field a preset could be saved from, with the value it holds now, which is the officer's own to see. */
export interface ISavableField {
    /** The field's key in the report's data. */
    readonly key: string;
    /** The field's name for the officer, such as "Agency City". */
    readonly label: string;
    /** The field's path in the report's data, such as `agencyCity` or `persons[1].first`. */
    readonly path: string;
    readonly value: unknown;
}

/** The answered fields in one place on the report: the report itself, or one page of a list of pages. */
export interface ISavableGroup {
    readonly fields: ReadonlyArray<ISavableField>;
    /** The page's position in its list, counting from zero. Absent for the report itself. */
    readonly index?: number;
    /** The list the page is in, such as `persons`. Absent for the report itself. */
    readonly list?: string;
    /** Where the fields sit, for the officer: "The report", or "Persons, page 2". */
    readonly title: string;
}

/** What the user has chosen to save. */
export interface ISaveRequest {
    /** The lists to keep the number of pages of, blank. */
    readonly pageCounts: ReadonlySet<string>;
    /** The paths ticked, such as `agencyName` or `persons[1].nonMotoristUnitType`. */
    readonly selected: ReadonlySet<string>;
    /** What the preset is called. */
    readonly title: string;
}

/** Defines the service that works out what a preset does to a report, what of a report can be kept as a preset, and applies, saves and deletes them. */
export interface IPresetService {
    /**
     * Applies the preset to the report the controllers hold, in one change, so it is one step to undo, and records what
     * it did: the preset applied, with the fields it changed, and then each field it left alone, with why. Answers with
     * the plan it applied. A preset that would do nothing changes and records nothing. Rejects, changing nothing, when
     * the report cannot take it or was edited while it was being applied.
     */
    apply(controllers: IControllerManager, preset: IReportPreset, overwrite: boolean): Promise<IPresetPlan>;
    /** The lists of pages the report has, so a preset can keep the number of pages of one. */
    getPageLists(current: IReportData): ReadonlyArray<IPageList>;
    /** What a preset could be saved from, grouped by where it sits: answered, not locked, and not the report's own identity. */
    getSavableGroups(current: IReportData, locked?: ReadOnlyFields<IReportData>): ReadonlyArray<ISavableGroup>;
    /** Spells a contract key out for the officer: `personHeaderPersonType` reads "Person Header Person Type". */
    humanize(key: string): string;
    /**
     * Whether a field holds an answer. A box left unchecked and a number left alone report false and zero, which cannot
     * be told from an answer of no or of zero, so they count as not answered -- as does an option box with nothing chosen.
     */
    isAnswered(value: unknown): boolean;
    /**
     * Works out what applying the preset to the report would do. A field the host locked is never written, and one the
     * report already answers is not unless told to overwrite. One already holding what the preset sets is neither.
     */
    plan(preset: IReportPreset, current: IReportData, locked: ReadOnlyFields<IReportData> | undefined, overwrite: boolean): IPresetPlan;
    /** Has the host delete a preset the user saved, and records that it was deleted. Rejects, recording nothing, when the host cannot or will not. */
    remove(controllers: IControllerManager, dataManager: IReportViewerDataManager<any>, id: string): Promise<void>;
    /**
     * Has the host keep a preset made of what the user ticked on the report the controllers hold, as one of their own,
     * and records that it was saved, naming the fields and never what they held. Answers with the preset saved. Rejects,
     * recording nothing, when the host cannot keep presets, or refuses this one.
     */
    save(controllers: IControllerManager, dataManager: IReportViewerDataManager<any>, request: ISaveRequest): Promise<IReportPreset>;
    /** Builds a preset's data from what was ticked, by path such as `agencyName` or `persons[1].nonMotoristUnitType`. `pageCounts` are lists to keep the number of pages of, blank. */
    toPresetData(current: IReportData, selected: ReadonlySet<string>, pageCounts: ReadonlySet<string>): Record<string, unknown>;
}

/** What planning and saving borrow of the service they belong to, so that a service that changes either changes them too. */
type PresetRules = Pick<IPresetService, "humanize" | "isAnswered">;

interface IContext {
    readonly overwrite: boolean;
    readonly pages: Array<IPagesAdded>;
    readonly rules: PresetRules;
    readonly skipped: Array<IPresetSkip>;
    readonly written: Array<string>;
}

const identityKeys: ReadonlySet<string> = new Set(["id", "name", "revision", "status", "type", "version", "workflow"]);

/** Matches the page a path sits on, such as `persons[1].`, at the start of it. */
const pageOf = /^(\w+)\[(\d+)\]\./;

/** Matches a path into a page, such as `persons[1].nonMotoristUnitType`. */
const pagePath = /^(\w+)\[(\d+)\]\.(\w+)$/;

/** An option box, which holds its answer in its value: it reports a blank one when it is left alone. */
function isOptionBox(value: unknown): value is { readonly value: unknown } {
    return typeof value === "object" && value !== null && !Array.isArray(value) && "value" in value && "description" in value;
}

function isList(value: unknown): value is ReadonlyArray<unknown> {
    return Array.isArray(value) && value.some(isRecord);
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
            context.pages.push({ added: wanted.length - have, label: context.rules.humanize(path), list: path });
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

    if (!context.overwrite && context.rules.isAnswered(current)) {
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

/** Sorts the paths under the page they sit on, the report's own first, each page titled for the officer. */
function toPlannedGroups(fields: ReadonlyArray<string>, rules: PresetRules): ReadonlyArray<IPlannedGroup> {
    const groups = new Map<string | undefined, Array<string>>([[undefined, []]]);

    for (const field of fields) {
        const match = pageOf.exec(field);
        const title = match ? `${rules.humanize(match[1])}, page ${Number(match[2]) + 1}` : undefined;

        groups.set(title, [...(groups.get(title) ?? []), field]);
    }

    return [...groups].filter(([, members]) => members.length > 0).map(([title, members]) => ({ fields: members, title }));
}

/** The answered, unlocked single fields of a record, each at `prefix`. A value that is itself a record, or a list of them, is not one. */
function toFields(record: Record<string, unknown>, locks: Record<string, unknown>, prefix: string, rules: PresetRules): ReadonlyArray<ISavableField> {
    return Object.entries(record)
        .filter(([key, value]) => rules.isAnswered(value) && !locks[key] && !isRecord(value) && !isList(value))
        .map(([key, value]) => ({ key, label: rules.humanize(key), path: prefix ? `${prefix}.${key}` : key, value }));
}

@Singleton
export class PresetService implements IPresetService {
    async apply(controllers: IControllerManager, preset: IReportPreset, overwrite: boolean): Promise<IPresetPlan> {
        const controller = controllers.getFormController();
        const base = controller.form;
        // planned against the form as it stands now, since that is what it is applied to
        const plan = this.plan(preset, base.extractData(), base.readOnlyFields, overwrite);

        // nothing to write is nothing to do, and nothing to record
        if (plan.fields.length === 0 && plan.pages.length === 0) {
            return plan;
        }

        // the lock a host preset carries is applied with it
        const populated = await base.populate({ data: { ...plan.data, name: base.name, status: base.status, type: base.type, version: base.version }, readOnlyFields: plan.readOnlyFields });

        // populate can take a moment on a form that adds pages, and a form edited meanwhile would be written over
        if (controller.form !== base) {
            throw new Error("The report changed while the preset was being applied. Apply it again.");
        }

        controller.update({ update: () => populated, reason: { kind: "preset-applied", preset: preset.id } });
        getAuditController(controllers).recordPresetSkipped(preset.id, plan.skipped);

        return plan;
    }

    getPageLists(current: IReportData): ReadonlyArray<IPageList> {
        const lists: Array<IPageList> = [];

        for (const [list, value] of Object.entries(current)) {
            if (isList(value)) {
                lists.push({ count: value.length, label: this.humanize(list), list });
            }
        }

        return lists;
    }

    getSavableGroups(current: IReportData, locked?: ReadOnlyFields<IReportData>): ReadonlyArray<ISavableGroup> {
        const locks: Record<string, unknown> = isRecord(locked) ? locked : {};
        const own = toFields(Object.fromEntries(Object.entries(current).filter(([key]) => !identityKeys.has(key))), locks, "", this);
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

                pages.push({ fields: toFields(page, isRecord(pageLocks) ? pageLocks : {}, `${list}[${index}]`, this), index, list, title: `${this.humanize(list)}, page ${index + 1}` });
            });
        }

        return [{ fields: own, title: "The report" }, ...pages].filter(group => group.fields.length > 0);
    }

    humanize(key: string): string {
        const spaced = key.replace(/([A-Z])/g, " $1").trim();

        return spaced.charAt(0).toUpperCase() + spaced.slice(1);
    }

    isAnswered(value: unknown): boolean {
        if (isOptionBox(value)) {
            return this.isAnswered(value.value);
        }

        return !(value === undefined || value === null || value === "" || value === false || value === 0 || (Array.isArray(value) && value.length === 0));
    }

    plan(preset: IReportPreset, current: IReportData, locked: ReadOnlyFields<IReportData> | undefined, overwrite: boolean): IPresetPlan {
        const context: IContext = { overwrite, pages: [], rules: this, skipped: [], written: [] };
        const cutDown = cut(preset.data, current, locked, "", context);
        const data = isRecord(cutDown) ? cutDown : {};

        return {
            data,
            fields: context.written,
            groups: toPlannedGroups(context.written, this),
            pages: context.pages,
            readOnlyFields: cutLocks(preset.readOnlyFields, data) as ReadOnlyFields<IReportData> | undefined,
            skipped: context.skipped
        };
    }

    async remove(controllers: IControllerManager, dataManager: IReportViewerDataManager<any>, id: string): Promise<void> {
        if (!dataManager.deletePreset) {
            throw new Error("The host cannot delete presets.");
        }

        await dataManager.deletePreset(id);
        getAuditController(controllers).recordPresetDeleted(id);
    }

    async save(controllers: IControllerManager, dataManager: IReportViewerDataManager<any>, { pageCounts, selected, title }: ISaveRequest): Promise<IReportPreset> {
        if (!dataManager.writePreset) {
            throw new Error("The host cannot keep presets.");
        }

        const current = controllers.getFormController().form.extractData();
        const saved: IReportPreset = { data: this.toPresetData(current, selected, pageCounts), id: crypto.randomUUID(), isPersonal: true, title };

        await dataManager.writePreset(saved);
        getAuditController(controllers).recordPresetSaved(saved.id, [...selected, ...pageCounts]);

        return saved;
    }

    toPresetData(current: IReportData, selected: ReadonlySet<string>, pageCounts: ReadonlySet<string>): Record<string, unknown> {
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
}

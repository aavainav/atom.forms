import React, { useMemo } from "react";
import { IReportData, FFieldControl, FFieldInput, FListGroup, FListGroupCheckbox, FListGroupHeading, ReadOnlyFields } from "@forms/core";

import { humanize } from "../../utils/humanize";
import { getPageLists, getSavableGroups, ISavableGroup } from "../../utils/savable-groups";

/** What the user has chosen to save. */
export interface ISaveRequest {
    /** The lists to keep the number of pages of, blank. */
    readonly pageCounts: ReadonlySet<string>;
    /** The paths ticked, such as `agencyName` or `persons[1].nonMotoristUnitType`. */
    readonly selected: ReadonlySet<string>;
    /** What the preset is called. */
    readonly title: string;
}

/** What the user has chosen before they have chosen anything. Nothing is ticked to begin with. */
export const emptySaveRequest: ISaveRequest = { pageCounts: new Set(), selected: new Set(), title: "" };

interface IPresetSaveFormProps {
    /** What the report holds now. */
    readonly current: IReportData;
    /** Which fields the host closed, which are never offered. */
    readonly locked?: ReadOnlyFields<IReportData>;
    /** What the user has chosen so far. */
    readonly value: ISaveRequest;

    /** Invoked with what the user has chosen, each time it changes. */
    onChange: (value: ISaveRequest) => void;
}

const getPath = ({ index, list }: ISavableGroup, key: string): string => list === undefined ? key : `${list}[${index}].${key}`;

const getTitle = ({ index, list }: ISavableGroup): string => list === undefined ? "The report" : `${humanize(list)}, page ${(index ?? 0) + 1}`;

/** Says a value the way the officer would read it. */
function describe(value: unknown): string {
    if (typeof value === "boolean") {
        return value ? "Yes" : "No";
    }

    if (typeof value === "object" && value !== null && "description" in value) {
        return String(value.description);
    }

    return Array.isArray(value) ? value.join(", ") : String(value);
}

/** Adds the values to the set, or takes them out of it. */
function change(previous: ReadonlySet<string>, values: ReadonlyArray<string>, checked: boolean): ReadonlySet<string> {
    const next = new Set(previous);
    values.forEach(value => checked ? next.add(value) : next.delete(value));

    return next;
}

/** Says why a preset cannot be saved yet, if it cannot: it needs a name, and something to keep. */
export function getSaveBlocker({ pageCounts, selected, title }: ISaveRequest): string | undefined {
    if (title.trim().length === 0) {
        return "Name the preset to save it.";
    }

    return selected.size === 0 && pageCounts.size === 0 ? "Tick what to keep." : undefined;
}

/**
 * Defines the step a preset is saved from: a name, and what of the report to keep, grouped by where it sits. What the
 * user has chosen is the caller's to hold, so that whatever saves it can be reached without scrolling this list.
 */
export const PresetSaveForm = ({ current, locked, value, onChange }: IPresetSaveFormProps): React.JSX.Element => {
    const groups = useMemo(() => getSavableGroups(current, locked), [current, locked]);
    const lists = useMemo(() => getPageLists(current), [current]);

    return (
        <>
            <FFieldControl border="visible" borderEdges={["bottom"]}>
                <FFieldInput id="preset-title" autocomplete="off" autofocus placeholder="Name this preset" value={value.title} onChange={title => onChange({ ...value, title: (title as string | undefined) ?? "" })} />
            </FFieldControl>

            {lists.length > 0 && (
                <FListGroup id="preset-pages">
                    <FListGroupHeading>Pages</FListGroupHeading>
                    {lists.map(({ count, list }) => (
                        <FListGroupCheckbox
                            key={list}
                            id={`preset-pages-${list}`}
                            checked={value.pageCounts.has(list)}
                            label={`Keep ${count} ${humanize(list)} ${count === 1 ? "page" : "pages"}, blank`}
                            onChange={checked => onChange({ ...value, pageCounts: change(value.pageCounts, [list], checked) })} />
                    ))}
                </FListGroup>
            )}

            {groups.map(group => {
                const paths = group.fields.map(({ key }) => getPath(group, key));
                const ticked = paths.filter(path => value.selected.has(path)).length;

                return (
                    <FListGroup key={getTitle(group)} id={`preset-group-${getTitle(group)}`}>
                        <FListGroupHeading>{getTitle(group)}</FListGroupHeading>
                        <FListGroupCheckbox
                            id={`preset-all-${getTitle(group)}`}
                            checked={ticked === paths.length}
                            indeterminate={ticked > 0 && ticked < paths.length}
                            label="Everything here"
                            onChange={checked => onChange({ ...value, selected: change(value.selected, paths, checked) })} />
                        {group.fields.map(({ key, value: held }) => (
                            <FListGroupCheckbox
                                key={getPath(group, key)}
                                id={`preset-field-${getPath(group, key)}`}
                                checked={value.selected.has(getPath(group, key))}
                                label={`${humanize(key)}: ${describe(held)}`}
                                onChange={checked => onChange({ ...value, selected: change(value.selected, [getPath(group, key)], checked) })} />
                        ))}
                    </FListGroup>
                );
            })}
        </>
    );
};

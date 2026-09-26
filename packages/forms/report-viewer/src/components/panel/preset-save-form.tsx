import React, { useMemo, useState } from "react";
import { IReportData, FButton, FFieldControl, FFieldInput, FListGroup, FListGroupCheckbox, FListGroupHeading, ReadOnlyFields } from "@forms/core";

import { humanize } from "../../utils/humanize";
import { getPageLists, getSavableGroups, ISavableGroup } from "../../utils/savable-groups";

/** What the user chose to save. */
export interface ISaveRequest {
    /** The lists to keep the number of pages of, blank. */
    readonly pageCounts: ReadonlySet<string>;
    /** The paths ticked, such as `agencyName` or `persons[1].nonMotoristUnitType`. */
    readonly selected: ReadonlySet<string>;
    /** What the preset is called. */
    readonly title: string;
}

interface IPresetSaveFormProps {
    /** What the report holds now. */
    readonly current: IReportData;
    /** Which fields the host closed, which are never offered. */
    readonly locked?: ReadOnlyFields<IReportData>;

    /** Invoked when the user goes back without saving. */
    onCancel: () => void;
    /** Invoked with what the user chose to save. */
    onSave: (request: ISaveRequest) => void;
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

/** Defines the step a preset is saved from: a name, and what of the report to keep, grouped by where it sits. Nothing is ticked to begin with. */
export const PresetSaveForm = ({ current, locked, onCancel, onSave }: IPresetSaveFormProps): React.JSX.Element => {
    const [pageCounts, setPageCounts] = useState<ReadonlySet<string>>(new Set());
    const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
    const [title, setTitle] = useState("");

    const groups = useMemo(() => getSavableGroups(current, locked), [current, locked]);
    const lists = useMemo(() => getPageLists(current), [current]);

    const canSave = title.trim().length > 0 && (selected.size > 0 || pageCounts.size > 0);

    return (
        <>
            <FFieldControl border="visible" borderEdges={["bottom"]}>
                <FFieldInput id="preset-title" autocomplete="off" placeholder="Name this preset" value={title} onChange={value => setTitle((value as string | undefined) ?? "")} />
            </FFieldControl>

            {lists.length > 0 && (
                <FListGroup id="preset-pages">
                    <FListGroupHeading>Pages</FListGroupHeading>
                    {lists.map(({ count, list }) => (
                        <FListGroupCheckbox
                            key={list}
                            id={`preset-pages-${list}`}
                            checked={pageCounts.has(list)}
                            label={`Keep ${count} ${humanize(list)} ${count === 1 ? "page" : "pages"}, blank`}
                            onChange={checked => setPageCounts(previous => change(previous, [list], checked))} />
                    ))}
                </FListGroup>
            )}

            {groups.map(group => {
                const paths = group.fields.map(({ key }) => getPath(group, key));
                const ticked = paths.filter(path => selected.has(path)).length;

                return (
                    <FListGroup key={getTitle(group)} id={`preset-group-${getTitle(group)}`}>
                        <FListGroupHeading>{getTitle(group)}</FListGroupHeading>
                        <FListGroupCheckbox
                            id={`preset-all-${getTitle(group)}`}
                            checked={ticked === paths.length}
                            indeterminate={ticked > 0 && ticked < paths.length}
                            label="Everything here"
                            onChange={checked => setSelected(previous => change(previous, paths, checked))} />
                        {group.fields.map(({ key, value }) => (
                            <FListGroupCheckbox
                                key={getPath(group, key)}
                                id={`preset-field-${getPath(group, key)}`}
                                checked={selected.has(getPath(group, key))}
                                label={`${humanize(key)}: ${describe(value)}`}
                                onChange={checked => setSelected(previous => change(previous, [getPath(group, key)], checked))} />
                        ))}
                    </FListGroup>
                );
            })}

            <FButton id="preset-cancel-button" variant="light" type="button" text="Cancel" onClick={onCancel} />
            <FButton id="preset-save-button" variant="primary" type="button" disabled={!canSave} text="Save" onClick={() => onSave({ pageCounts, selected, title: title.trim() })} />
        </>
    );
};

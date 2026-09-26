import React from "react";
import { FFieldControl, FFieldInput, FListGroup, FListGroupCheckbox, FListGroupHeading } from "@forms/core";

import { IPageList, ISavableGroup, ISaveRequest } from "../../services";

/** What the user has chosen before they have chosen anything. Nothing is ticked to begin with. */
export const emptySaveRequest: ISaveRequest = { pageCounts: new Set(), selected: new Set(), title: "" };

interface IPresetSaveFormProps {
    /** What can be saved, grouped by where it sits. */
    readonly groups: ReadonlyArray<ISavableGroup>;
    /** The lists of pages the report has, of which the number of pages can be kept. */
    readonly lists: ReadonlyArray<IPageList>;
    /** What the user has chosen so far. */
    readonly value: ISaveRequest;

    /** Invoked with what the user has chosen, each time it changes. */
    onChange: (value: ISaveRequest) => void;
}

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
export const PresetSaveForm = ({ groups, lists, value, onChange }: IPresetSaveFormProps): React.JSX.Element => {
    return (
        <>
            <FFieldControl border="visible" borderEdges={["bottom"]}>
                <FFieldInput id="preset-title" autocomplete="off" autofocus placeholder="Name this preset" value={value.title} onChange={title => onChange({ ...value, title: (title as string | undefined) ?? "" })} />
            </FFieldControl>

            {lists.length > 0 && (
                <FListGroup id="preset-pages">
                    <FListGroupHeading>Pages</FListGroupHeading>
                    {lists.map(({ count, label, list }) => (
                        <FListGroupCheckbox
                            key={list}
                            id={`preset-pages-${list}`}
                            checked={value.pageCounts.has(list)}
                            label={`Keep ${count} ${label} ${count === 1 ? "page" : "pages"}, blank`}
                            onChange={checked => onChange({ ...value, pageCounts: change(value.pageCounts, [list], checked) })} />
                    ))}
                </FListGroup>
            )}

            {groups.map(group => {
                const paths = group.fields.map(({ path }) => path);
                const ticked = paths.filter(path => value.selected.has(path)).length;

                return (
                    <FListGroup key={group.title} id={`preset-group-${group.title}`}>
                        <FListGroupHeading>{group.title}</FListGroupHeading>
                        <FListGroupCheckbox
                            id={`preset-all-${group.title}`}
                            checked={ticked === paths.length}
                            indeterminate={ticked > 0 && ticked < paths.length}
                            label="Everything here"
                            onChange={checked => onChange({ ...value, selected: change(value.selected, paths, checked) })} />
                        {group.fields.map(({ label, path, value: held }) => (
                            <FListGroupCheckbox
                                key={path}
                                id={`preset-field-${path}`}
                                checked={value.selected.has(path)}
                                label={`${label}: ${describe(held)}`}
                                onChange={checked => onChange({ ...value, selected: change(value.selected, [path], checked) })} />
                        ))}
                    </FListGroup>
                );
            })}
        </>
    );
};

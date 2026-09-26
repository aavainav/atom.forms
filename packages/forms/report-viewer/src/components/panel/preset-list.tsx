import React, { Fragment, useMemo, useState } from "react";
import { FFieldControl, FFieldInput, FListGroup, FListGroupHeading, FListGroupItem } from "@forms/core";

import { IReportPreset } from "../../services";

/** The heading the user's own presets are listed under, ahead of the rest. */
const personalHeading = "My presets";

interface IPresetListProps {
    /** The presets to offer, the host's and the user's. */
    readonly presets: ReadonlyArray<IReportPreset<any>>;
    /** The id of the preset chosen, if one is. */
    readonly selected?: string;

    /** Invoked with the id of the preset chosen. */
    onSelect: (id: string) => void;
}

/** One heading and the presets under it; the presets with no group sit under none. */
interface ISection {
    readonly heading?: string;
    readonly presets: ReadonlyArray<IReportPreset<any>>;
}

/** Narrows the presets to those whose title, description or group holds the term. */
function filter(presets: ReadonlyArray<IReportPreset<any>>, term: string): ReadonlyArray<IReportPreset<any>> {
    const match = term.trim().toLowerCase();

    return match
        ? presets.filter(preset => [preset.title, preset.description, preset.group].some(text => text?.toLowerCase().includes(match)))
        : presets;
}

/** Sorts the presets under their headings: the user's own first, then those with no group, then each group in the order the host first gave it. */
function toSections(presets: ReadonlyArray<IReportPreset<any>>): ReadonlyArray<ISection> {
    const sections = new Map<string | undefined, Array<IReportPreset<any>>>([[personalHeading, []], [undefined, []]]);

    for (const preset of presets) {
        const heading = preset.isPersonal ? personalHeading : preset.group || undefined;
        sections.set(heading, [...(sections.get(heading) ?? []), preset]);
    }

    return [...sections].filter(([, members]) => members.length > 0).map(([heading, members]) => ({ heading, presets: members }));
}

/** Renders the searchable list of presets, grouped, one of which is chosen. */
export const PresetList = ({ presets, selected, onSelect }: IPresetListProps): React.JSX.Element => {
    const [term, setTerm] = useState("");

    const sections = useMemo(() => toSections(filter(presets, term)), [presets, term]);

    return (
        <>
            <FFieldControl border="visible" borderEdges={["bottom"]}>
                <FFieldInput id="preset-search" autocomplete="off" enableClear placeholder="Search presets..." value={term} onChange={value => setTerm((value as string | undefined) ?? "")} />
            </FFieldControl>

            {presets.length === 0 && <p id="preset-list-empty">No presets yet. Save one from the report.</p>}
            {presets.length > 0 && sections.length === 0 && <p id="preset-list-no-match">No presets match that search.</p>}

            {sections.length > 0 && (
                <FListGroup id="preset-list">
                    {sections.map(({ heading, presets: members }) => (
                        <Fragment key={heading ?? ""}>
                            {heading && <FListGroupHeading>{heading}</FListGroupHeading>}
                            {members.map(preset => (
                                <FListGroupItem key={preset.id} id={`preset-${preset.id}`} active={preset.id === selected} onClick={() => onSelect(preset.id)}>
                                    <div><strong>{preset.title}</strong></div>
                                    {preset.description && <div><small>{preset.description}</small></div>}
                                </FListGroupItem>
                            ))}
                        </Fragment>
                    ))}
                </FListGroup>
            )}
        </>
    );
};

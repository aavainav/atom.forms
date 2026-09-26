import React, { Fragment, useState } from "react";
import { FListGroup, FListGroupHeading, FListGroupItem } from "@forms/core";

import { IReportTemplate } from "../../services";

/** One choice in the list: a template of the host's, or the form's own default when it has no id. */
interface IEntry {
    readonly description?: string;
    readonly group?: string;
    readonly id?: string;
    readonly title: string;
}

/** The entries under one heading, or under none. */
interface ISection {
    readonly entries: ReadonlyArray<IEntry>;
    readonly heading?: string;
}

interface ITemplatePickerProps {
    /** Whether the form's own default is offered, first. False when the host names its own. */
    readonly includeBlank: boolean;
    /** The id selected to begin with; the form's own default when undefined. */
    readonly selected?: string;
    /** The host's templates, in the order they are listed. */
    readonly templates: ReadonlyArray<IReportTemplate>;

    /** Invoked with the id of the template chosen, or undefined for the form's own default. */
    onChange: (id: string | undefined) => void;
}

const blank: IEntry = { description: "The form as it starts, with nothing chosen for it.", title: "Blank" };

/** Sorts the entries under their headings: those with none first, then each group in the order the host first gave it. */
function toSections(entries: ReadonlyArray<IEntry>): ReadonlyArray<ISection> {
    const sections = new Map<string | undefined, Array<IEntry>>([[undefined, []]]);

    for (const entry of entries) {
        const heading = entry.group || undefined;
        sections.set(heading, [...(sections.get(heading) ?? []), entry]);
    }

    return [...sections].filter(([, members]) => members.length > 0).map(([heading, members]) => ({ entries: members, heading }));
}

/** Defines the body of the dialog a new form is started from: what it can start with, one of which is chosen. */
export const TemplatePicker = ({ includeBlank, selected, templates, onChange }: ITemplatePickerProps): React.JSX.Element => {
    const [current, setCurrent] = useState(selected);

    const choose = (id: string | undefined): void => {
        setCurrent(id);
        onChange(id);
    };

    const sections = toSections([...(includeBlank ? [blank] : []), ...templates]);

    return (
        <FListGroup id="template-picker">
            {sections.map(({ entries, heading }) => (
                <Fragment key={heading ?? ""}>
                    {heading && <FListGroupHeading>{heading}</FListGroupHeading>}
                    {entries.map(entry => (
                        <FListGroupItem key={entry.id ?? ""} id={entry.id === undefined ? "template-blank" : `template-option-${entry.id}`} active={current === entry.id} onClick={() => choose(entry.id)}>
                            <div><strong>{entry.title}</strong></div>
                            {entry.description && <div><small>{entry.description}</small></div>}
                        </FListGroupItem>
                    ))}
                </Fragment>
            ))}
        </FListGroup>
    );
};

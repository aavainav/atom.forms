import React, { Fragment, useState } from "react";
import { FListGroup, FListGroupHeading, FListGroupItem, IFormVariant } from "@forms/core";

import { IReportTemplate } from "../../services";

/** What the user picked: a template of the host's, a variant of the form's with the host's default under it, or neither for the form's own default. */
export interface ITemplateChoice {
    readonly template?: string;
    readonly variant?: string;
}

/** One choice in the list. */
interface IEntry {
    readonly choice: ITemplateChoice;
    readonly description?: string;
    readonly group?: string;
    readonly id: string;
    readonly title: string;
}

/** The entries under one heading, or under none. */
interface ISection {
    readonly entries: ReadonlyArray<IEntry>;
    readonly heading?: string;
}

interface ITemplatePickerProps {
    /** The host's default template, laid under whichever variant is picked. */
    readonly baseTemplate?: string;
    /** Whether the form's own default is offered, first. False when the host names its own, or the form has variants. */
    readonly includeBlank: boolean;
    /** What is selected to begin with. */
    readonly selected: ITemplateChoice;
    /** The host's templates, in the order they are listed. */
    readonly templates: ReadonlyArray<IReportTemplate>;
    /** The form's own blank forms, listed first under their own heading. */
    readonly variants: ReadonlyArray<IFormVariant>;

    /** Invoked with what was chosen. */
    onChange: (choice: ITemplateChoice) => void;
}

const blank: IEntry = { choice: {}, description: "The form as it starts, with nothing chosen for it.", id: "template-blank", title: "Blank" };

/** Whether two choices pick the same thing. */
function isSame(a: ITemplateChoice, b: ITemplateChoice): boolean {
    return a.template === b.template && a.variant === b.variant;
}

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
export const TemplatePicker = ({ baseTemplate, includeBlank, selected, templates, variants, onChange }: ITemplatePickerProps): React.JSX.Element => {
    const [current, setCurrent] = useState(selected);

    const choose = (choice: ITemplateChoice): void => {
        setCurrent(choice);
        onChange(choice);
    };

    const blanks: ReadonlyArray<IEntry> = variants.map(variant => ({
        choice: { template: baseTemplate, variant: variant.id },
        description: variant.description,
        id: `template-variant-${variant.id}`,
        title: variant.title
    }));

    const entries: ReadonlyArray<IEntry> = [
        ...(includeBlank ? [blank] : []),
        ...templates.map(({ description, group, id, title }) => ({ choice: { template: id }, description, group, id: `template-option-${id}`, title }))
    ];

    const renderEntry = (entry: IEntry): React.JSX.Element => (
        <FListGroupItem key={entry.id} id={entry.id} active={isSame(current, entry.choice)} onClick={() => choose(entry.choice)}>
            <div><strong>{entry.title}</strong></div>
            {entry.description && <div><small>{entry.description}</small></div>}
        </FListGroupItem>
    );

    return (
        <>
            {blanks.length > 0 && (
                <div className="mb-2">
                    <FListGroup id="template-blank-forms">
                        <FListGroupHeading>Blank forms</FListGroupHeading>
                        {blanks.map(renderEntry)}
                    </FListGroup>
                </div>
            )}
            {entries.length > 0 && (
                <FListGroup id="template-picker">
                    {blanks.length > 0 && <FListGroupHeading>Templates</FListGroupHeading>}
                    {toSections(entries).map(({ entries: members, heading }) => (
                        <Fragment key={heading ?? ""}>
                            {heading && <FListGroupHeading>{heading}</FListGroupHeading>}
                            {members.map(renderEntry)}
                        </Fragment>
                    ))}
                </FListGroup>
            )}
        </>
    );
};

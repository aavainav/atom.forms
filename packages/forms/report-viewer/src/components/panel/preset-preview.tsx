import React from "react";
import { FBadge, FListGroup, FListGroupHeading, FListGroupItem } from "@forms/core";

import { humanize } from "../../utils/humanize";
import { IPresetPlan } from "../../utils/plan-preset";

interface IPresetPreviewProps {
    /** What applying the preset would do. */
    readonly plan: IPresetPlan;
}

/** The fields on one page, or the report's own when there is no page. */
interface IPageFields {
    readonly fields: ReadonlyArray<string>;
    readonly page?: string;
}

/** The page a path sits on, such as "Persons, page 2", or nothing for a field of the report itself. */
function getPage(path: string): string | undefined {
    const match = /^(\w+)\[(\d+)\]\./.exec(path);

    return match ? `${humanize(match[1])}, page ${Number(match[2]) + 1}` : undefined;
}

/** Sorts the paths under the page they are on, the report's own first. */
function toPages(fields: ReadonlyArray<string>): ReadonlyArray<IPageFields> {
    const pages = new Map<string | undefined, Array<string>>([[undefined, []]]);

    for (const field of fields) {
        const page = getPage(field);
        pages.set(page, [...(pages.get(page) ?? []), field]);
    }

    return [...pages].filter(([, members]) => members.length > 0).map(([page, members]) => ({ fields: members, page }));
}

/** Shows what a preset would do to the report: the pages it would add, the fields it would set, and those it would leave alone, with why. */
export const PresetPreview = ({ plan }: IPresetPreviewProps): React.JSX.Element => {
    if (plan.fields.length === 0 && plan.pages.length === 0 && plan.skipped.length === 0) {
        return <p id="preset-preview-empty">Nothing to apply: the report already holds all of this.</p>;
    }

    return (
        <FListGroup id="preset-preview">
            {plan.pages.length > 0 && <FListGroupHeading>Adds</FListGroupHeading>}
            {plan.pages.map(({ added, list }) => <FListGroupItem key={list}>{added} {humanize(list)} {added === 1 ? "page" : "pages"}</FListGroupItem>)}

            {toPages(plan.fields).map(({ fields, page }) => (
                <React.Fragment key={page ?? ""}>
                    <FListGroupHeading>Will set{page ? `: ${page}` : ""} ({fields.length})</FListGroupHeading>
                    {fields.map(field => <FListGroupItem key={field}>{field}</FListGroupItem>)}
                </React.Fragment>
            ))}

            {plan.skipped.length > 0 && <FListGroupHeading>Left alone ({plan.skipped.length})</FListGroupHeading>}
            {plan.skipped.map(({ field, reason }) => (
                <FListGroupItem key={field}>
                    {field} <FBadge variant={reason === "locked" ? "secondary" : "light"}>{reason === "locked" ? "Locked" : "Answered"}</FBadge>
                </FListGroupItem>
            ))}
        </FListGroup>
    );
};

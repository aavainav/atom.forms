import React from "react";
import { FBadge, FListGroup, FListGroupHeading, FListGroupItem } from "@forms/core";

import { IPresetPlan } from "../../services";

interface IPresetPreviewProps {
    /** What applying the preset would do. */
    readonly plan: IPresetPlan;
}

/** Shows what a preset would do to the report: the pages it would add, the fields it would set, and those it would leave alone, with why. */
export const PresetPreview = ({ plan }: IPresetPreviewProps): React.JSX.Element => {
    if (plan.fields.length === 0 && plan.pages.length === 0 && plan.skipped.length === 0) {
        return <p id="preset-preview-empty">Nothing to apply: the report already holds all of this.</p>;
    }

    return (
        <FListGroup id="preset-preview">
            {plan.pages.length > 0 && <FListGroupHeading>Adds</FListGroupHeading>}
            {plan.pages.map(({ added, label, list }) => <FListGroupItem key={list}>{added} {label} {added === 1 ? "page" : "pages"}</FListGroupItem>)}

            {plan.groups.map(({ fields, title }) => (
                <React.Fragment key={title ?? ""}>
                    <FListGroupHeading>Will set{title ? `: ${title}` : ""} ({fields.length})</FListGroupHeading>
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

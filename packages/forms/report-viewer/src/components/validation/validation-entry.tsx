import React from "react";

import { IRuleIssue, FIcon, RuleIssueSeverity } from "@forms/core";

interface IValidationErrorEntryProps {
    /** The rule issue to display. */
    readonly issue: IRuleIssue;
}

/** Defines a validation error entry for a field. */
export const ValidationErrorEntry = ({ issue }: IValidationErrorEntryProps): React.JSX.Element => {
    const page = issue.section.getPageDefinition();

    return (
        <div className="border-bottom mb-2 pb-2">
            <FIcon icon="exclamation-circle" size="lg" />
            <div className="text-muted small">{page.title} &rsaquo; {issue.section.title}</div>
            <div className="fw-bold">{issue.field.label}</div>
            <div className={issue.severity === RuleIssueSeverity.error ? "text-danger" : "text-warning"}>{issue.message}</div>
        </div>
    );
}

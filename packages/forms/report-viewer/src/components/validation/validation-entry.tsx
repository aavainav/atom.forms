import React from "react";

import { IRuleIssue, RuleIssueSeverity } from "@forms/core";

interface IValidationErrorEntryProps {
    /** The rule issue to display. */
    readonly issue: IRuleIssue;
}

/** Defines a validation error entry for a field. */
export const ValidationErrorEntry = ({ issue }: IValidationErrorEntryProps): React.JSX.Element => {
    return (
        <div className="mb-2">
            <div className="fw-bold">{issue.field.label}</div>
            <div className={issue.severity === RuleIssueSeverity.error ? "text-danger" : "text-warning"}>{issue.message}</div>
        </div>
    );
}

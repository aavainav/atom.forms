import React from "react";

import { IRuleViolation, RuleViolationSeverity } from "@forms/core";

interface IValidationErrorEntryProps {
    /** The rule violation to display. */
    readonly violation: IRuleViolation;
}

/** Defines a validation error entry for a field. */
export const ValidationErrorEntry = ({ violation }: IValidationErrorEntryProps): React.JSX.Element => {
    return (
        <div className="mb-2">
            <div className="fw-bold">{violation.field.label}</div>
            <div className={violation.severity === RuleViolationSeverity.error ? "text-danger" : "text-warning"}>{violation.message}</div>
        </div>
    );
}

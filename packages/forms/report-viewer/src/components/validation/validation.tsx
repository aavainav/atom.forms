import React from "react";

import { IRuleViolation, FOffCanvas } from "@forms/core";

import { ValidationErrorEntry } from "./validation-entry";

interface IValidationProps {
    readonly violations: ReadonlyArray<IRuleViolation>;
}

/** Defines the validation component, which is an off canvas that displays a list of violations. */
export default function Validation({ violations }: IValidationProps): React.JSX.Element {
    return (
        <FOffCanvas id="validation-errors">
            <FOffCanvas.Header borderVisibility="visible"><h5>Validation Errors</h5></FOffCanvas.Header>
            <FOffCanvas.Body>
                {violations.length === 0
                    ? <div className="text-muted fst-italic">No validation issues found.</div>
                    : violations.map((violation, index) => <ValidationErrorEntry key={index} violation={violation} />)}
            </FOffCanvas.Body>
        </FOffCanvas>
    );
}

import React from "react";

import { IControllerManager, IRuleIssue, FOffCanvas } from "@forms/core";

import { ValidationErrorEntry } from "./validation-entry";

interface IValidationProps {
    /** The controllers belonging to the form this validation panel is for, so an entry can navigate to its field. */
    readonly controllers: IControllerManager;
    readonly issues: ReadonlyArray<IRuleIssue>;
    /** Whether the off canvas is currently shown. */
    readonly isOpen: boolean;
    /** Invoked when the off canvas is closed. */
    readonly onClose: () => void;
}

/** Defines the validation component, which is an off canvas that displays a list of issues. */
export default function Validation({ controllers, issues, isOpen, onClose }: IValidationProps): React.JSX.Element {
    return (
        <FOffCanvas id="validation-errors" isOpen={isOpen}>
            <FOffCanvas.Header borderVisibility="visible" onClose={onClose}><h5>Validation Errors</h5></FOffCanvas.Header>
            <FOffCanvas.Body>
                {issues.length === 0
                    ? <div className="text-muted fst-italic">No validation issues found.</div>
                    : issues.map((issue, index) => (
                        <ValidationErrorEntry key={index} controllers={controllers} issue={issue} onNavigate={onClose} />
                    ))}
            </FOffCanvas.Body>
        </FOffCanvas>
    );
}

import React from "react";

import { FGrid, FIcon, FListGroupItem, IControllerManager, IRuleIssue, RuleIssueSeverity } from "@forms/core";

interface IValidationErrorEntryProps {
    /** The controllers belonging to the form this issue is for, so the entry can navigate to its field. */
    readonly controllers: IControllerManager;
    /** The rule issue to display. */
    readonly issue: IRuleIssue;
    /** Invoked after the entry navigates the form to its field. */
    readonly onNavigate: () => void;
}

/** Spells a field's name out as a label, for a field with none of its own: "latitude" reads "Latitude". */
function toLabel(name: string): string {
    return name.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

/** Defines one issue in the validation panel: its field and its message, on one line. Clicking it shows the field's page and focuses it. */
export const ValidationErrorEntry = ({ controllers, issue, onNavigate }: IValidationErrorEntryProps): React.JSX.Element => {
    const isErrorSeverity = issue.severity === RuleIssueSeverity.error;
    const label = issue.field.label || toLabel(issue.field.name);

    const handleClick = (): void => {
        const pageId = controllers.getFormController().form.getPageIdForIssue(issue);

        if (pageId && issue.field.id) {
            controllers.getNavigationController().goTo({ pageId, fieldId: issue.field.id });
        }
    };

    return (
        <FListGroupItem onClick={handleClick}>
            <FGrid>
                <FGrid.Row>
                    <FGrid.Column auto>
                        <FIcon
                            icon={isErrorSeverity ? "exclamation-circle" : "exclamation-triangle"}
                            variant={isErrorSeverity ? "danger" : "warning"}
                        />
                    </FGrid.Column>
                    <FGrid.Column truncate>
                        <div><span className="fs-6 fw-semibold">{label}</span></div>
                        <div><small className="fw-light text-muted">{issue.message}</small></div>
                    </FGrid.Column>
                </FGrid.Row>
            </FGrid>
        </FListGroupItem>
    );
};
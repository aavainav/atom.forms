import React from "react";

import { IControllerManager, IRuleIssue, FGrid, FIcon, RuleIssueSeverity } from "@forms/core";

interface IValidationErrorEntryProps {
    /** The controllers belonging to the form this issue is for, so the entry can navigate to its field. */
    readonly controllers: IControllerManager;
    /** The rule issue to display. */
    readonly issue: IRuleIssue;
    /** Invoked after the entry navigates the form to its field. */
    readonly onNavigate: () => void;
}

/** Defines a validation error entry for a field. Clicking it shows the field's page and focuses it. */
export const ValidationErrorEntry = ({ controllers, issue, onNavigate }: IValidationErrorEntryProps): React.JSX.Element => {
    const page = issue.section.getPageDefinition();
    const isErrorSeverity = issue.severity === RuleIssueSeverity.error;

    const handleClick = (): void => {
        const pageId = controllers.getFormController().form.getPageIdForIssue(issue);

        if (pageId && issue.field.id) {
            controllers.getNavigationController().goTo({ pageId, fieldId: issue.field.id });
        }

        onNavigate();
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleClick();
        }
    };

    return (
        <div
            className="border-bottom mb-2 pb-2"
            role="button"
            tabIndex={0}
            style={{ cursor: "pointer" }}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
        >
            <FGrid>
                <FGrid.Row>
                    <FGrid.Column auto>
                        <FIcon
                            icon={isErrorSeverity ? "exclamation-circle" : "exclamation-triangle"}
                            size="md"
                            variant={isErrorSeverity ? "danger" : "warning"}
                        />
                    </FGrid.Column>
                    <FGrid.Column auto>
                        <div className="text-muted small">{page.title} &rsaquo; {issue.section.title}</div>
                        <div className="fw-bold">{issue.field.label}</div>
                        <div className={isErrorSeverity ? "text-danger" : "text-warning"}>{issue.message}</div>
                    </FGrid.Column>
                </FGrid.Row>
            </FGrid>
        </div>
    );
}

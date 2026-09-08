import React from "react";
import { useService } from "@common/react";
import { FButton, FIcon, FTooltip, IControllerManager, IRuleIssue } from "@forms/core";

import { INotificationService } from "../../services";
import { IValidationService } from "../../services/validation";

interface IValidateOptionProps {
    /** The controllers belonging to the form being validated. */
    readonly controllers: IControllerManager;
}

/** Defines the option for validating the current report. */
export const ValidateOption = ({ controllers }: IValidateOptionProps): React.JSX.Element => {
    const notificationService = useService<INotificationService>(INotificationService);
    const validationService = useService<IValidationService>(IValidationService);

    const handleValidate = (): void => {
        const formController = controllers.getFormController();

        // the rules controller is cached by the manager and reads the current form, so its issues survive edits
        const rulesController = controllers.getRulesController();
        rulesController.validate();

        const issueCollection = rulesController.getIssueCollection();
        const result: ReadonlyArray<IRuleIssue> = issueCollection.getIssues();
        validationService.showIssues(result);

        formController.update(form => form.validate(issueCollection));

        notificationService.showNotification(
            result.length === 0
                ? { type: "success", message: "No validation issues found." }
                : { type: "danger", message: `${result.length} validation issue(s) found.` }
        );
    };

    return (
        <FTooltip title="Validate" placement="top">
            <FButton id="validate-button" variant="light" type="button" onClick={handleValidate}>
                <FIcon icon="shield-check" />
            </FButton>
        </FTooltip>
    );
}

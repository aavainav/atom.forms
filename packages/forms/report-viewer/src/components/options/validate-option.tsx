import React from "react";
import { useService } from "@common/react";
import { FButton, FIcon, FTooltip } from "@forms/core";

import { INotificationService, IReportViewerOptionProps } from "../../services";
import { IValidationService } from "../../services/validation";


/** Defines the option for validating the current report. */
export const ValidateOption = ({ controllers, title }: IReportViewerOptionProps): React.JSX.Element => {
    const notificationService = useService<INotificationService>(INotificationService);
    const validationService = useService<IValidationService>(IValidationService);

    const handleValidate = (): void => {
        const result = validationService.validate(controllers).getIssues();

        notificationService.showNotification(
            result.length === 0
                ? { type: "success", message: "No validation issues found." }
                : { type: "danger", message: `${result.length} validation issue(s) found.` }
        );
    };

    return (
        <FTooltip title={title} placement="right">
            <FButton id="validate-button" variant="light" type="button" onClick={handleValidate}>
                <FIcon icon="shield-check" />
            </FButton>
        </FTooltip>
    );
}

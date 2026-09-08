import React, { useState } from "react";
import { useService } from "@common/react";
import { FButton, FIcon, FOffCanvasContext, FTooltip, IControllerManager, IRuleViolation } from "@forms/core";

import { Validation } from "../validation";
import { INotificationService } from "../../services";

interface IValidateOptionProps {
    /** The controllers belonging to the form being validated. */
    readonly controllers: IControllerManager;
}

/** Defines the option for validating the current report. */
export const ValidateOption = ({ controllers }: IValidateOptionProps): React.JSX.Element => {
    const notificationService = useService<INotificationService>(INotificationService);

    const [violations, setViolations] = useState<Array<IRuleViolation>>([]);
    const [showViolations, setShowViolations] = useState(false);

    const handleValidate = (): void => {
        const formController = controllers.getFormController();

        // the rules controller is cached by the manager and reads the current form, so its violations survive edits
        const rulesController = controllers.getRulesController();
        rulesController.validate();

        const violationCollection = rulesController.getViolationCollection();
        const result = violationCollection.getViolations();
        setViolations(result);
        if (result.length > 0) setShowViolations(true);

        formController.update(form => form.validate(violationCollection));

        notificationService.showNotification(
            result.length === 0
                ? { type: "success", message: "No validation issues found." }
                : { type: "danger", message: `${result.length} validation issue(s) found.` }
        );
    };

    return (
        <>
            <FTooltip title="Validate" placement="top">
                <FButton id="validate-button" variant="light" type="button" onClick={handleValidate}>
                    <FIcon icon="shield-check" />
                </FButton>
            </FTooltip>
            <FOffCanvasContext.Provider value={{ showOffCanvas: showViolations, hideOffCanvas: () => setShowViolations(false) }}>
                <Validation violations={violations} />
            </FOffCanvasContext.Provider>
        </>
    );
}

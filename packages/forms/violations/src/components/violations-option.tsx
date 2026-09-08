import React from "react";
import { useService } from "@common/react";
import { FButton, FIcon, FTooltip } from "@forms/core";

import { IViolationPickerService } from "../services";

/** Defines the option for choosing the violations the citation is written for. */
export const ViolationsOption = (): React.JSX.Element => {
    const violationPickerService = useService<IViolationPickerService>(IViolationPickerService);

    return (
        <FTooltip title="Violations" placement="top">
            <FButton id="violations-button" variant="light" type="button" onClick={() => violationPickerService.openPicker()}>
                <FIcon icon="card-checklist" />
            </FButton>
        </FTooltip>
    );
}

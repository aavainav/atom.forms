import React from "react";
import { useService } from "@common/react";
import { FButton, FIcon, FTooltip } from "@forms/core";

import { IReportViewerOptionProps } from "@forms/report-viewer";

import { IViolationSelectorService } from "../services";

/** Defines the option for choosing the violations the citation is written for. */
export const ViolationsOption = ({ title }: IReportViewerOptionProps): React.JSX.Element => {
    const violationSelectorService = useService<IViolationSelectorService>(IViolationSelectorService);

    return (
        <FTooltip title={title} placement="top">
            <FButton id="violations-button" variant="light" type="button" onClick={() => violationSelectorService.openSelector()}>
                <FIcon icon="card-checklist" />
            </FButton>
        </FTooltip>
    );
}

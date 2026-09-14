import React from "react";
import { useService } from "@common/react";
import { FButton, FIcon, FTooltip } from "@forms/core";

import { IViolationSelectorService } from "../services";

/** Defines the props the violations option is rendered with. Declared here rather than imported so that nothing in this package depends on whoever renders it. */
export interface IViolationsOptionProps {
    /** The name the option is offered under, shown as its tooltip. */
    readonly title: string;
}

/** Defines the option for choosing the violations the citation is written for. */
export const ViolationsOption = ({ title }: IViolationsOptionProps): React.JSX.Element => {
    const violationSelectorService = useService<IViolationSelectorService>(IViolationSelectorService);

    return (
        <FTooltip title={title} placement="top">
            <FButton id="violations-button" variant="light" type="button" onClick={() => violationSelectorService.openSelector()}>
                <FIcon icon="card-checklist" />
            </FButton>
        </FTooltip>
    );
}

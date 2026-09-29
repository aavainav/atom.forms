import React from "react";
import { useService } from "@common/react";
import { FButton, FIcon, FTooltip } from "@forms/core";

import { IPresetSelectorService, IReportViewerOptionProps } from "../../services";

/** Defines the option for choosing a preset to apply to the report. */
export const PresetsOption = ({ title }: IReportViewerOptionProps): React.JSX.Element => {
    const presetSelectorService = useService<IPresetSelectorService>(IPresetSelectorService);

    return (
        <FTooltip title={title} placement="right">
            <FButton id="presets-button" variant="light" type="button" onClick={() => presetSelectorService.openSelector()}>
                <FIcon icon="bookmark-star" />
            </FButton>
        </FTooltip>
    );
};

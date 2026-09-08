import React from "react";

import { FButton, FIcon, FTooltip } from "@forms/core";

/** Defines the day/night mode option. This will change the ui report viewer to dark or light. */
export const DayNightModeOption = (): React.JSX.Element => {
    return (
        <>
            <FTooltip title="Toggle day/night mode" placement="top">
                <FButton id="day-night-mode-button" variant="light" type="button">
                    <FIcon icon="moon-stars" />
                </FButton>
            </FTooltip>
        </>
    );
}

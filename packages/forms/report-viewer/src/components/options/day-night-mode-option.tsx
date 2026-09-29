import React, { useEffect, useState } from "react";
import { useService } from "@common/react";
import { FButton, FIcon, FTooltip } from "@forms/core";

import { IReportViewerOptionProps } from "../../services";
import { IThemeService, Theme } from "../../services/theme";

/** Defines the day/night mode option. This will change the ui report viewer to dark or light. */
export const DayNightModeOption = ({ title }: IReportViewerOptionProps): React.JSX.Element => {
    const themeService = useService<IThemeService>(IThemeService);

    const [theme, setTheme] = useState<Theme>(themeService.theme);

    useEffect(() => {
        const listener = themeService.onThemeChanged(setTheme);
        return () => listener.remove();
    }, [themeService]);

    return (
        <FTooltip title={title} placement="right">
            <FButton id="day-night-mode-button" variant="light" type="button" onClick={() => themeService.toggleTheme()}>
                <FIcon icon={theme === "dark" ? "sun" : "moon-stars"} />
            </FButton>
        </FTooltip>
    );
}

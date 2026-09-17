import React from "react";
import { FButton, FIcon, FTooltip } from "@forms/core";
import { IReportViewerOptionProps } from "@forms/report-viewer";

import { getExampleTestData } from "../example-data";

/**
 * Demo-only option: fills the currently open form with its "full" test-data fixture, the interactive equivalent of
 * opening it with `?record=full`. It goes through the form's own `populate`, exactly as a data manager's `read`
 * would, so it exercises the same path a host's real data takes.
 */
export const LoadTestDataOption = ({ catalogItem, controllers, onError, title }: IReportViewerOptionProps): React.JSX.Element => {
    const handleLoadTestData = async (): Promise<void> => {
        const result = getExampleTestData(catalogItem);

        if (!result) {
            return;
        }

        try {
            const populated = await controllers.getFormController().form.populate(result);
            controllers.getFormController().setForm(populated);
        }
        catch (error) {
            onError(error instanceof Error ? error.message : "The test data could not be loaded.");
        }
    };

    return (
        <FTooltip title={title} placement="top">
            <FButton id="load-test-data-button" variant="light" type="button" onClick={handleLoadTestData}>
                <FIcon icon="clipboard-data" />
            </FButton>
        </FTooltip>
    );
};

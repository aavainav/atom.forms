import React from "react";
import { useLocation, useSearchParams } from "react-router";
import { FButton, FIcon, FTooltip } from "@forms/core";
import { IReportViewerOptionProps } from "@forms/report-viewer";

import { clearExampleData } from "../example-data";
import { findFormRouteByPath } from "../form-routes";

/**
 * Demo-only option: loads the report this host holds for the form, the interactive equivalent of opening it with
 * `?record=held`. It is a real load, not a fill: the viewer is opened again and asked for the record the way it is
 * whenever a report is opened, so the record comes back with its audit history, its comments and its workflow history,
 * and the audit says the form was loaded.
 *
 * Only the form routes reload when asked to, so it offers nothing anywhere else, such as on a demo page.
 */
export const LoadTestDataOption = ({ catalogItem, title }: IReportViewerOptionProps): React.JSX.Element | null => {
    const { pathname } = useLocation();
    const [, setSearchParams] = useSearchParams();

    if (!findFormRouteByPath(pathname)) {
        return null;
    }

    const handleLoad = (): void => {
        // what was saved for the form would be read in place of the held report, so it goes first
        clearExampleData(catalogItem);

        // the nonce is what has the route page open the viewer again, since the same record twice is no change to the url.
        // a template is dropped, since a viewer given one starts a new report from it instead of opening the held one
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            next.set("record", "held");
            next.set("load", String(Date.now()));
            next.delete("template");
            return next;
        });
    };

    return (
        <FTooltip title={title} placement="top">
            <FButton id="load-test-data-button" variant="light" type="button" onClick={handleLoad}>
                <FIcon icon="clipboard-data" />
            </FButton>
        </FTooltip>
    );
};

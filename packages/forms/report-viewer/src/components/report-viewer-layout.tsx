import React from "react";
import { Outlet } from "react-router";

/**
 * Defines the layout for the "report-viewer" route. Renders the matched child route -- a form-specific route
 * registered by a form package, or whatever the host registers as the index -- via `<Outlet />`.
 */
export default function ReportViewerLayout(): React.JSX.Element {
    return <Outlet />;
}

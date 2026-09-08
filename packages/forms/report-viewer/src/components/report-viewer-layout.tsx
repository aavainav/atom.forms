import React from "react";
import { Outlet } from "react-router";

/**
 * Defines the layout for the "report-viewer" route. Renders the matched child route (the generic
 * data-driven `ReportViewerLoader` index route, or a form-specific route registered by a form package)
 * via `<Outlet />`.
 */
export default function ReportViewerLayout(): React.JSX.Element {
    return <Outlet />;
}

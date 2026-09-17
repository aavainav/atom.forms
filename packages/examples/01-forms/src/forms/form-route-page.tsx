import React, { useMemo } from "react";
import { useLocation, useSearchParams } from "react-router";
import { ReportViewer } from "@forms/report-viewer";

import { createExampleDataManager } from "../example-data";
import { findFormRouteByPath } from "../form-routes";
import { NotFound } from "@forms/workbench";

/**
 * The one route component every catalog form in this app is rendered by.
 *
 * There is no such thing as a form-specific loader any more: the report viewer takes the form's identity and the
 * host's data manager as props and does the resolving, building, populating and rendering itself, so a route that
 * knows which form it is looking at is the whole of what a host has to write. Which form that is comes from the
 * matched path, against the app's own route table -- the same table the routes were registered from.
 */
export default function FormRoutePage(): React.JSX.Element {
    const { pathname } = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();

    const route = findFormRouteByPath(pathname);

    // the manager closes over the query string the form was opened with, which is what picks the fixture scenario,
    // and can update it back -- e.g. stamping ?record=new on the url once a "new form" reset actually happens, so
    // a refresh sees the same state instead of silently reading back whatever was last saved
    const dataManager = useMemo(() => route && createExampleDataManager(route.identity, searchParams, setSearchParams), [route, searchParams]);

    if (!route) {
        return <NotFound />;
    }

    return <ReportViewer identity={route.identity} dataManager={dataManager} settings={{ showOptions: true }} />;
}

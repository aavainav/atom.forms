import React, { useEffect, useMemo, useRef } from "react";
import { useBlocker, useLocation, useSearchParams } from "react-router";
import { useService } from "@common/react";
import { IModalService, IReportViewerComponent, ReportViewer } from "@forms/report-viewer";

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
 *
 * The ref is what lets this page ask the rendered form whether it is dirty, without the report viewer needing to
 * know anything about routing: `useBlocker` is this app's own router, held together entirely on this side.
 */
export default function FormRoutePage(): React.JSX.Element {
    const { pathname } = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const modalService = useService<IModalService>(IModalService);

    const route = findFormRouteByPath(pathname);

    // the manager closes over the query string the form was opened with, which is what picks the fixture scenario,
    // and can update it back -- e.g. stamping ?record=new on the url once a "new form" reset actually happens, so
    // a refresh sees the same state instead of silently reading back whatever was last saved
    const dataManager = useMemo(() => route && createExampleDataManager(route.identity, searchParams, setSearchParams), [route, searchParams]);

    const reportViewerRef = useRef<IReportViewerComponent>(null);

    // a search-param-only change (e.g. clicking "Load test data") isn't leaving the page, so only a real route
    // change is worth checking the form's dirty state for
    const blocker = useBlocker(({ currentLocation, nextLocation }) =>
        currentLocation.pathname !== nextLocation.pathname && !!reportViewerRef.current?.getIsDirty());

    useEffect(() => {
        if (blocker.state !== "blocked") {
            return;
        }

        const leave = async (): Promise<void> => blocker.proceed?.();
        const stay = async (): Promise<void> => blocker.reset?.();

        if (!reportViewerRef.current?.canSave()) {
            modalService.showConfirmModal({
                title: "Leave this form?",
                message: "Any unsaved changes will be lost.",
                confirmText: "Leave",
                onCancel: stay,
                onConfirm: leave
            });
            return;
        }

        modalService.showSaveChangesModal({
            onCancel: stay,
            onDiscard: leave,
            onSave: async () => {
                await dataManager?.write?.(reportViewerRef.current!.extractData());
                await leave();
            }
        });
        // only a real transition into "blocked" should prompt -- depending on the whole blocker object would
        // reopen the modal on top of itself for unrelated re-renders while it is still blocked
    }, [blocker.state]);

    if (!route) {
        return <NotFound />;
    }

    return <ReportViewer ref={reportViewerRef} identity={route.identity} dataManager={dataManager} settings={{ showOptions: true }} />;
}

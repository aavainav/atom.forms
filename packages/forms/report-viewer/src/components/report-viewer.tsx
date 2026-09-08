import React from "react";
import { Outlet } from "react-router";
import { useService } from "@common/react";
import { IControllerManager } from "@forms/core";

import { ModalManager } from "./modal";
import { ReportViewerForm } from "./report-viewer-form";
import { IInitialForm, IReportViewerService } from "../services";

interface IReportViewerProps {
    /** The controllers to use for the form; when omitted the viewer creates and owns a set of its own. Supply this when something outside the viewer, such as a panel of draggable items, needs the same controllers as the form. */
    readonly controllers?: IControllerManager;
    readonly initialForm?: IInitialForm;
}

/** Defines the report viewer component, used to render a form into view from the form catalog. */
export const ReportViewer = ({ controllers, initialForm }: IReportViewerProps): React.JSX.Element => {
    const reportViewerService = useService<IReportViewerService>(IReportViewerService);

    const isReadOnly = reportViewerService.isReadOnly;

    return (
        <div id="report-viewer" className="d-flex flex-column">
            {initialForm
                ? <ReportViewerForm controllers={controllers} initialForm={initialForm} isReadOnly={isReadOnly} showOptions />
                : <><Outlet /><ModalManager /></>}
        </div>
    );
}

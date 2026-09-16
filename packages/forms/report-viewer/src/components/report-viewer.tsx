import React from "react";
import { useService } from "@common/react";
import { FAsyncLoader, FLoadingIndicator, IFormIdentity, IReportData } from "@forms/core";

import { ReportViewerForm } from "./report-viewer-form";
import { IInitialForm, IReportViewerDataManager, IReportViewerService } from "../services";

import "@forms/core/theme/_main.scss";

/** Defines how a report is rendered, as opposed to which one is rendered or where its data comes from. */
export interface IReportViewerSettings {
    /** When true, every field on the form is disabled and its editing affordances (add/delete page, drag-and-drop import) are not offered. */
    readonly isReadOnly?: boolean;
    /** Whether the options bar is rendered beneath the form. */
    readonly showOptions?: boolean;
}

export interface IReportViewerProps<TData extends object = IReportData> {
    /** Which form to render. The catalog resolves it, and answers with its latest version when no version is named. */
    readonly identity: IFormIdentity;
    /** Where the form's data is read from and written back to. A viewer without one renders a blank, unsaveable form. */
    readonly dataManager?: IReportViewerDataManager<TData>;
    /** How the form is rendered. */
    readonly settings?: IReportViewerSettings;
}

/**
 * Renders a report: the host names a form and hands over its data, and everything else -- resolving the catalog
 * item, building the model, populating it, and mounting the options and panels the form offers -- happens here.
 * This is the whole of what a host app needs; nothing below it has to be reached for.
 *
 * A host that needs more than these three props -- controllers shared with something rendered outside the form, or
 * a mutation of the model after it loads -- takes the longer way round instead: `IReportViewerService.loadForm`
 * and then `ReportViewerForm`, which is exactly what this does.
 */
export function ReportViewer<TData extends object = IReportData>({ identity, dataManager, settings }: IReportViewerProps<TData>): React.JSX.Element {
    const reportViewerService = useService<IReportViewerService>(IReportViewerService);

    return (
        <div id="report-viewer" className="d-flex flex-column">
            {/*
              * FAsyncLoader runs its op once, on mount, so a changed identity would otherwise leave the previously
              * loaded form on screen. The key remounts it instead, which is also what drops the old form's
              * controllers rather than re-seeding them with a form from a different definition tree.
              */}
            <FAsyncLoader<IInitialForm>
                key={`${identity.name}@${identity.version ?? ""}`}
                op={() => reportViewerService.loadForm(identity, dataManager)}
                loading={<FLoadingIndicator message={`Loading ${identity.name} form...`} />}>
                {initialForm => (
                    <ReportViewerForm
                        initialForm={initialForm}
                        dataManager={dataManager}
                        isReadOnly={!!settings?.isReadOnly}
                        showOptions={settings?.showOptions}
                    />
                )}
            </FAsyncLoader>
        </div>
    );
}

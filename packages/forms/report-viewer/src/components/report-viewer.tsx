import React, { forwardRef } from "react";
import { useService } from "@common/react";
import { IActor, IFormIdentity, IReportData, IUserPreferences, FAsyncLoader, FLoadingIndicator, FormMode } from "@forms/core";

import { IReportViewerComponent, ReportViewerForm } from "./report-viewer-form";
import { IInitialForm, IReportViewerDataManager, IReportViewerService } from "../services";

import "@forms/core/theme/_main.scss";

/** Defines how a report is rendered, as opposed to which one is rendered or where its data comes from. */
export interface IReportViewerSettings {
    /** How the form's fields and editing affordances behave. Defaults to "editable". */
    readonly mode?: FormMode;
    /** The current user's own settings -- favorites, and the like. Without one, they're loaded from and saved to the browser's own storage, keyed by `user`'s id. Given one, it is used as-is and never written back here -- persisting a later change is the host's own responsibility. */
    readonly preferences?: IUserPreferences;
    /** Whether the options bar is rendered beneath the form. */
    readonly showOptions?: boolean;
    /** Who is using the report: the audit records and the review comments are attributed to them. A reviewable form without one shows its comments but cannot add any. */
    readonly user?: IActor;
}

export interface IReportViewerProps<TData extends object = IReportData> {
    /** Which form to render. The catalog resolves it, and answers with its latest version when no version is named. */
    readonly identity: IFormIdentity;
    /** Where the form's data is read from and written back to. A viewer without one renders a blank, unsaveable form. */
    readonly dataManager?: IReportViewerDataManager<TData>;
    /** How the form is rendered. */
    readonly settings?: IReportViewerSettings;
    /** Starts a new report from this template of the host's, in place of opening one. */
    readonly template?: string;
}

/**
 * Renders a report: the host names a form and hands over its data; resolving the catalog item, building and
 * populating the model, and mounting options/panels all happen here. Nothing below this has to be reached for.
 *
 * A host needing more -- shared controllers, or mutating the model after load -- takes the longer way round:
 * `IReportViewerService.loadForm` then `ReportViewerForm` directly, which is exactly what this does.
 */
function ReportViewerInner<TData extends object = IReportData>(
    { identity, dataManager, settings, template }: IReportViewerProps<TData>,
    ref: React.ForwardedRef<IReportViewerComponent>
): React.JSX.Element {
    const reportViewerService = useService<IReportViewerService>(IReportViewerService);

    return (
        <div id="report-viewer" className="d-flex flex-column">
            {/* FAsyncLoader's op runs once on mount, so a changed identity would leave the old form on screen without
                this key remounting it -- which also drops the old controllers rather than re-seeding a new tree. */}
            <FAsyncLoader<IInitialForm>
                key={`${identity.name}@${identity.version ?? ""}`}
                op={() => reportViewerService.loadForm(identity, dataManager, template ? "new" : "open", template)}
                loading={<FLoadingIndicator message={`Loading ${identity.name} form...`} />}>
                {initialForm => (
                    <ReportViewerForm
                        ref={ref}
                        initialForm={initialForm}
                        dataManager={dataManager}
                        mode={settings?.mode ?? "editable"}
                        preferences={settings?.preferences}
                        showOptions={settings?.showOptions}
                        user={settings?.user}
                    />
                )}
            </FAsyncLoader>
        </div>
    );
}

// forwardRef erases a component's own generic type parameter, so the result is cast back to one here -- the
// standard shape for a generic component that also forwards a ref.
export const ReportViewer = forwardRef(ReportViewerInner) as <TData extends object = IReportData>(
    props: IReportViewerProps<TData> & { ref?: React.Ref<IReportViewerComponent> }
) => React.JSX.Element;

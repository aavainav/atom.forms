import React, { useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { useService } from "@common/react";
import { ControllerManager, FAsyncLoader, FormMode, FormStatus, IControllerManager, getStatusWatermark } from "@forms/core";
import { IInitialForm, IReportViewerService, ReportViewerForm } from "@forms/report-viewer";

import { createExampleDataManager } from "../../example-data";

/** The catalog form the demo stamps. The public contact/warning form is a single page, so the watermark is in view without paging, and its make/model dropdowns show the placeholder rule too. */
const catalogIdentity = { name: "SC Form 432 - Public Contact / Warning", version: "1.0" };

/** The statuses the demo offers, in the order the picker lists them. */
const demoStatuses: ReadonlyArray<FormStatus> = ["draft", "inProgress", "issued", "approved", "canceled", "rejected", "voided"];

/** The display name for each status, since the status itself is camel cased. */
const statusLabels: Record<FormStatus, string> = {
    approved: "Approved",
    canceled: "Canceled",
    draft: "Draft",
    inProgress: "In Progress",
    issued: "Issued",
    rejected: "Rejected",
    voided: "Voided"
};

interface IFormModeDemoFormProps {
    readonly controllers: IControllerManager;
    readonly initialForm: IInitialForm;
    readonly mode: FormMode;
    readonly status: FormStatus;
}

/** Describes what the form on screen should be showing, so the rule is legible without reading the code. */
function describeMode(status: FormStatus, mode: FormMode): string {
    if (mode === "editable") {
        return "Editable: fields are enabled, empty selects show their placeholder, and no watermark is stamped.";
    }

    const watermark = getStatusWatermark(status);

    return watermark
        ? `Viewable: fields are disabled, placeholders are hidden, and the page is stamped "${watermark}" -- the same as printing it.`
        : "Viewable: fields are disabled and placeholders are hidden, but this status carries no watermark -- the same as printing it.";
}

/** Renders the loaded form with the demo's status applied, which is how a form arriving from a data source would carry one. */
function FormModeDemoForm({ controllers, initialForm, mode, status }: IFormModeDemoFormProps): React.JSX.Element {
    // memoized so the status is stamped onto the loaded form once rather than on every render, which would have the
    // report viewer walk every field applying the mode again each time
    const form = useMemo(() => ({ ...initialForm, form: initialForm.form.setStatus(status) }), [initialForm, status]);

    return <ReportViewerForm controllers={controllers} initialForm={form} mode={mode} showOptions />;
}

/** Demonstrates how a form's mode changes what's on screen: the watermark each status stamps, fields disabling, and empty selects losing their placeholder -- everything a printed copy would show too. */
export default function FormModeDemoPage(): React.JSX.Element {
    const reportViewerService = useService<IReportViewerService>(IReportViewerService);

    const [searchParams, setSearchParams] = useSearchParams();

    // the controls are rendered outside the form, so the page owns the controllers and hands them to the form
    const controllers = useMemo(() => new ControllerManager(), []);

    const dataManager = useMemo(() => createExampleDataManager(catalogIdentity, searchParams, setSearchParams), [searchParams]);

    const [status, setStatus] = useState<FormStatus>("voided");
    const [mode, setMode] = useState<FormMode>("viewable");

    return (
        <div className="d-flex flex-column">
            <div className="d-flex align-items-end mb-3" style={{ gap: "1rem" }}>
                <div>
                    <label className="form-label" htmlFor="form-mode-demo-status">Status</label>
                    <select
                        id="form-mode-demo-status"
                        className="form-select"
                        value={status}
                        onChange={(e) => setStatus(e.target.value as FormStatus)}
                    >
                        {demoStatuses.map((demoStatus) => (
                            <option key={demoStatus} value={demoStatus}>{statusLabels[demoStatus]}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="form-label" htmlFor="form-mode-demo-mode">Mode</label>
                    <select
                        id="form-mode-demo-mode"
                        className="form-select"
                        value={mode}
                        onChange={(e) => setMode(e.target.value as FormMode)}
                    >
                        <option value="editable">Editable</option>
                        <option value="viewable">Viewable</option>
                    </select>
                </div>
                <div className="text-muted mb-2">{describeMode(status, mode)}</div>
            </div>
            {/*
                both controls reseed the form rather than edit the one on screen: the report viewer applies the mode as
                the form is loaded, and the controller manager only resets when the form's id changes, which neither
                setStatus nor setMode does. keying the loader re-runs the load, which builds a form with a new id.
            */}
            <FAsyncLoader<IInitialForm>
                key={`${status}:${mode}`}
                op={() => reportViewerService.loadForm(catalogIdentity, dataManager)}
            >
                {(initialForm) => (
                    <FormModeDemoForm controllers={controllers} initialForm={initialForm} mode={mode} status={status} />
                )}
            </FAsyncLoader>
        </div>
    );
}

import React, { useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { useService } from "@common/react";
import { ControllerManager, FAsyncLoader, FormStatus, IControllerManager, getStatusWatermark } from "@forms/core";
import { IInitialForm, IReportViewerService, ReportViewerForm } from "@forms/report-viewer";

import { createExampleDataManager } from "../../example-data";

/** The catalog form the demo stamps. The public contact/warning form is a single page, so the watermark is in view without paging. */
const catalogIdentity = { name: "SC Form 432 - Public Contact / Warning", version: "1.0" };

/** The statuses the demo offers, in the order the picker lists them. */
const demoStatuses: ReadonlyArray<FormStatus> = ["draft", "inProgress", "issued", "canceled", "rejected", "voided"];

/** The display name for each status, since the status itself is camel cased. */
const statusLabels: Record<FormStatus, string> = {
    canceled: "Canceled",
    draft: "Draft",
    inProgress: "In Progress",
    issued: "Issued",
    rejected: "Rejected",
    voided: "Voided"
};

interface IWatermarkDemoFormProps {
    readonly controllers: IControllerManager;
    readonly initialForm: IInitialForm;
    readonly isReadOnly: boolean;
    readonly status: FormStatus;
}

/** Describes what the form on screen should be showing, so the rule is legible without reading the code. */
function describeWatermark(status: FormStatus, isReadOnly: boolean): string {
    if (!isReadOnly) {
        return "Watermarks are hidden while the form is editable.";
    }

    const watermark = getStatusWatermark(status);

    return watermark ? `Stamped with "${watermark}".` : "This status carries no watermark.";
}

/** Renders the loaded form with the demo's status applied, which is how a form arriving from a data source would carry one. */
function WatermarkDemoForm({ controllers, initialForm, isReadOnly, status }: IWatermarkDemoFormProps): React.JSX.Element {
    // memoized so the status is stamped onto the loaded form once rather than on every render, which would have the
    // report viewer walk every field applying read-only again each time
    const form = useMemo(() => ({ ...initialForm, form: initialForm.form.setStatus(status) }), [initialForm, status]);

    return <ReportViewerForm controllers={controllers} initialForm={form} isReadOnly={isReadOnly} showOptions />;
}

/** Demonstrates the watermark each form status stamps across a page, and that a form carries one only while it renders read-only. */
export default function WatermarkDemoPage(): React.JSX.Element {
    const reportViewerService = useService<IReportViewerService>(IReportViewerService);

    const [searchParams, setSearchParams] = useSearchParams();

    // the controls are rendered outside the form, so the page owns the controllers and hands them to the form
    const controllers = useMemo(() => new ControllerManager(), []);

    const dataManager = useMemo(() => createExampleDataManager(catalogIdentity, searchParams, setSearchParams), [searchParams]);

    const [status, setStatus] = useState<FormStatus>("voided");
    const [isReadOnly, setIsReadOnly] = useState(true);

    return (
        <div className="d-flex flex-column">
            <div className="d-flex align-items-end mb-3" style={{ gap: "1rem" }}>
                <div>
                    <label className="form-label" htmlFor="watermark-demo-status">Status</label>
                    <select
                        id="watermark-demo-status"
                        className="form-select"
                        value={status}
                        onChange={(e) => setStatus(e.target.value as FormStatus)}
                    >
                        {demoStatuses.map((demoStatus) => (
                            <option key={demoStatus} value={demoStatus}>{statusLabels[demoStatus]}</option>
                        ))}
                    </select>
                </div>
                <div className="form-check mb-2">
                    <input
                        id="watermark-demo-read-only"
                        className="form-check-input"
                        type="checkbox"
                        checked={isReadOnly}
                        onChange={(e) => setIsReadOnly(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="watermark-demo-read-only">Read only</label>
                </div>
                <div className="text-muted mb-2">{describeWatermark(status, isReadOnly)}</div>
            </div>
            {/*
                both controls reseed the form rather than edit the one on screen: the report viewer applies read-only as
                the form is loaded, and the controller manager only resets when the form's id changes, which neither
                setStatus nor setReadOnly does. keying the loader re-runs the load, which builds a form with a new id.
            */}
            <FAsyncLoader<IInitialForm>
                key={`${status}:${isReadOnly}`}
                op={() => reportViewerService.loadForm(catalogIdentity, dataManager)}
            >
                {(initialForm) => (
                    <WatermarkDemoForm controllers={controllers} initialForm={initialForm} isReadOnly={isReadOnly} status={status} />
                )}
            </FAsyncLoader>
        </div>
    );
}

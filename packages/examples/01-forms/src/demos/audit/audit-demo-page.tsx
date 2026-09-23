import React, { useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { ReportViewer } from "@forms/report-viewer";

import AuditLog from "./audit-log";
import { createExampleDataManager } from "../../example-data";

type DemoForm = "s438" | "tr310";

/** The form each option opens, and what to call it in the switcher. */
const forms: Record<DemoForm, { readonly identity: { readonly name: string; readonly version: string }; readonly label: string }> = {
    // S438 repeats its front page per charge, so adding one shows a record being added
    s438: { identity: { name: "S438 Citation Form", version: "1.0" }, label: "Citation (S438)" },
    tr310: { identity: { name: "SC TR-310 - Traffic Collision Report", version: "1.0" }, label: "Crash report (TR-310)" }
};

/**
 * Demonstrates what the audit records as a form is worked on. Switching forms remounts the report viewer, as opening
 * a different report would, but the log underneath keeps running: `IAuditService.onRecord` is one subscription for
 * however many reports are opened over time, so a record raised for the last form is still there once you switch.
 */
export default function AuditDemoPage(): React.JSX.Element {
    const [searchParams, setSearchParams] = useSearchParams();
    const [formKey, setFormKey] = useState<DemoForm>("s438");

    const demoForm = forms[formKey];
    const dataManager = useMemo(() => createExampleDataManager(demoForm.identity, searchParams, setSearchParams), [demoForm, searchParams]);

    return (
        <div className="d-flex flex-column">
            <div className="mb-3">
                <label className="form-label" htmlFor="audit-demo-form">Form</label>
                <select id="audit-demo-form" className="form-select" style={{ width: "auto" }} value={formKey} onChange={(e) => setFormKey(e.target.value as DemoForm)}>
                    {(Object.keys(forms) as Array<DemoForm>).map((key) => <option key={key} value={key}>{forms[key].label}</option>)}
                </select>
            </div>
            <div className="d-flex align-items-start" style={{ gap: "1rem" }}>
                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    {/* keyed so switching forms opens the new one fresh, as a host opening a different report would */}
                    <ReportViewer key={formKey} identity={demoForm.identity} dataManager={dataManager} settings={{ showOptions: true }} />
                </div>
                <div style={{ width: 380, flexShrink: 0 }}>
                    <AuditLog />
                </div>
            </div>
        </div>
    );
}

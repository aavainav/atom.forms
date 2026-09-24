import React, { useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { FormMode } from "@forms/core";
import { IActor, ReportViewer } from "@forms/report-viewer";

import AuditLog from "./audit-log";
import { createExampleDataManager } from "../../example-data";

type DemoForm = "s438" | "tr310";
type DemoRole = "officer" | "reviewer" | "viewer";

/** The form each option opens, and what to call it in the switcher. */
const forms: Record<DemoForm, { readonly identity: { readonly name: string; readonly version: string }; readonly label: string }> = {
    // S438 repeats its front page per charge, so adding one shows a record being added
    s438: { identity: { name: "S438 Citation Form", version: "1.0" }, label: "Citation (S438)" },
    tr310: { identity: { name: "SC TR-310 - Traffic Collision Report", version: "1.0" }, label: "Crash report (TR-310)" }
};

/** Who opens the report in each role, and the mode the report viewer shows it in. Every record is attributed to them. */
const roles: Record<DemoRole, { readonly actor: IActor; readonly description: string; readonly label: string; readonly mode: FormMode }> = {
    officer: {
        actor: { agency: "Planet Express", badgeId: "2999", id: "fry", name: "Philip J. Fry", rank: "Delivery Boy" },
        description: "Editable: edit fields, add and delete pages, drop people and vehicles, choose violations, save, print.",
        label: "Officer",
        mode: "editable"
    },
    reviewer: {
        actor: { agency: "Central Bureaucracy", badgeId: "36", id: "bureaucrat-conrad", name: "Hermes Conrad", rank: "Grade 36 Bureaucrat" },
        description: "Reviewable: comment on the report, and resolve or reopen comments, alongside opening it and moving between pages.",
        label: "Reviewer",
        mode: "reviewable"
    },
    viewer: {
        actor: { agency: "New New York Municipal Court", id: "judge-whitey", name: "Judge Whitey" },
        description: "Viewable: nothing to change, so what is recorded is opening the report, moving between pages, and printing it.",
        label: "Viewer",
        mode: "viewable"
    }
};

/**
 * Demonstrates what the audit records as a form is worked on. Switching the form or the role remounts the report
 * viewer, as opening a report again would, but the log beside it keeps running: `IAuditService.onRecord` is one
 * subscription for however many reports are opened over time, so a record raised for the last one is still there once
 * you switch, and each names who it was raised for.
 */
export default function AuditDemoPage(): React.JSX.Element {
    const [searchParams, setSearchParams] = useSearchParams();
    const [formKey, setFormKey] = useState<DemoForm>("s438");
    const [role, setRole] = useState<DemoRole>("officer");

    const demoForm = forms[formKey];
    const dataManager = useMemo(() => createExampleDataManager(demoForm.identity, searchParams, setSearchParams), [demoForm, searchParams]);

    return (
        <div className="d-flex flex-column">
            <div className="d-flex align-items-end mb-3" style={{ gap: "1rem" }}>
                <div>
                    <label className="form-label" htmlFor="audit-demo-form">Form</label>
                    <select id="audit-demo-form" className="form-select" value={formKey} onChange={(e) => setFormKey(e.target.value as DemoForm)}>
                        {(Object.keys(forms) as Array<DemoForm>).map((key) => <option key={key} value={key}>{forms[key].label}</option>)}
                    </select>
                </div>
                <div>
                    <label className="form-label" htmlFor="audit-demo-role">Open it as</label>
                    <select id="audit-demo-role" className="form-select" value={role} onChange={(e) => setRole(e.target.value as DemoRole)}>
                        {(Object.keys(roles) as Array<DemoRole>).map((key) => <option key={key} value={key}>{roles[key].label}</option>)}
                    </select>
                </div>
            </div>
            <div className="text-muted mb-3">{roles[role].description}</div>
            <div className="d-flex align-items-start" style={{ gap: "1rem" }}>
                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    {/* keyed so a change of form or role opens the report again, as a host would: the mode and the user are applied as it loads */}
                    <ReportViewer
                        key={`${formKey}:${role}`}
                        identity={demoForm.identity}
                        dataManager={dataManager}
                        settings={{ mode: roles[role].mode, showOptions: true, user: roles[role].actor }}
                    />
                </div>
                <div style={{ width: 380, flexShrink: 0 }}>
                    <AuditLog />
                </div>
            </div>
        </div>
    );
}

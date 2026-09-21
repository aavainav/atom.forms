import React, { useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { FormMode } from "@forms/core";
import { AuditRecord, IActor, IReportViewerDataManager, IReviewComment, ReportViewer } from "@forms/report-viewer";

import { createExampleDataManager } from "../../example-data";

/** The catalog form the demo reviews. */
const catalogIdentity = { name: "SC Form 432 - Public Contact / Warning", version: "1.0" };

type DemoRole = "officer" | "reviewer" | "viewer";

/** What each role sees, and the mode the report viewer is given to show it. */
const roles: Record<DemoRole, { readonly description: string; readonly label: string; readonly mode: FormMode }> = {
    officer: {
        description: "Editable: comments show where a reviewer made them, and can be resolved and reopened as the officer deals with them.",
        label: "Officer",
        mode: "editable"
    },
    reviewer: {
        description: "Reviewable: the fields are locked, and any of them can be commented on -- as can a page, or the report as a whole from the review panel.",
        label: "Reviewer",
        mode: "reviewable"
    },
    viewer: {
        description: "Viewable: what a printed copy shows, with no comments on it.",
        label: "Viewer",
        mode: "viewable"
    }
};

/** Makes the id a host would hold for a user from what they are called, so the demo needs only the one field. */
function toActor(name: string): IActor | undefined {
    const trimmed = name.trim();

    return trimmed ? { id: trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "-"), name: trimmed } : undefined;
}

/** Demonstrates review: a reviewer's comments on a report, and the officer who reads and resolves them. Both work from the same comments and audit history, as a host's database would hold them. */
export default function ReviewDemoPage(): React.JSX.Element {
    const [searchParams, setSearchParams] = useSearchParams();

    const [role, setRole] = useState<DemoRole>("reviewer");
    const [savedAudit, setSavedAudit] = useState(0);
    const [savedComments, setSavedComments] = useState(0);
    const [userName, setUserName] = useState("Sgt. Rivera");

    // stand in for the host's database: they outlive a change of role, so what the reviewer writes is what the officer reads
    const audit = useRef<ReadonlyArray<AuditRecord>>([]);
    const comments = useRef<ReadonlyArray<IReviewComment>>([]);

    const dataManager = useMemo((): IReportViewerDataManager => {
        const record = createExampleDataManager(catalogIdentity, searchParams, setSearchParams);

        return {
            ...record,
            // the comments and the audit history come back with the record, in the one object
            read: async reason => {
                const result = await record?.read(reason);

                return result && { ...result, audit: audit.current, comments: comments.current };
            },
            // append-only: the records are new to the host, matched by id, so a record handed over twice is kept once
            writeAudit: async records => {
                const known = new Set(audit.current.map(held => held.id));

                audit.current = [...audit.current, ...records.filter(added => !known.has(added.id))];
                setSavedAudit(audit.current.length);
            },
            writeComments: async next => {
                comments.current = next;
                setSavedComments(next.length);
            }
        };
    }, [searchParams]);

    return (
        <div className="d-flex flex-column">
            <div className="d-flex align-items-end mb-3" style={{ gap: "1rem" }}>
                <div>
                    <label className="form-label" htmlFor="review-demo-role">Role</label>
                    <select id="review-demo-role" className="form-select" value={role} onChange={(e) => setRole(e.target.value as DemoRole)}>
                        {(Object.keys(roles) as Array<DemoRole>).map((demoRole) => (
                            <option key={demoRole} value={demoRole}>{roles[demoRole].label}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="form-label" htmlFor="review-demo-user">User</label>
                    <input id="review-demo-user" className="form-control" value={userName} onChange={(e) => setUserName(e.target.value)} />
                </div>
                <div className="text-muted mb-2">{roles[role].description} The host holds {savedComments} comment(s) and {savedAudit} audit record(s).</div>
            </div>
            {/* keyed on the role because the mode is applied as the form loads; the comments and the history survive the reload in the host's store */}
            <ReportViewer
                key={role}
                identity={catalogIdentity}
                dataManager={dataManager}
                settings={{ mode: roles[role].mode, showOptions: true, user: toActor(userName) }}
            />
        </div>
    );
}

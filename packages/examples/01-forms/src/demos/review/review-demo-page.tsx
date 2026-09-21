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

/** What the demo asks about the user, as a person would type it. */
interface IUserFields {
    readonly agency: string;
    readonly badgeId: string;
    readonly name: string;
    readonly rank: string;
}

/** Makes the actor a host would hold for the user from what was typed, leaving out what was left blank. */
function toActor({ agency, badgeId, name, rank }: IUserFields): IActor | undefined {
    const trimmed = name.trim();

    if (!trimmed) {
        return undefined;
    }

    return {
        // a host has its own id for a user; the demo makes one from the name so it needs only the one field
        id: trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        name: trimmed,
        ...(agency.trim() ? { agency: agency.trim() } : {}),
        ...(badgeId.trim() ? { badgeId: badgeId.trim() } : {}),
        ...(rank.trim() ? { rank: rank.trim() } : {})
    };
}

/** Demonstrates review: a reviewer's comments on a report, and the officer who reads and resolves them. Both work from the same comments and audit history, as a host's database would hold them. */
export default function ReviewDemoPage(): React.JSX.Element {
    const [searchParams, setSearchParams] = useSearchParams();

    const [role, setRole] = useState<DemoRole>("reviewer");
    const [savedAudit, setSavedAudit] = useState(0);
    const [savedComments, setSavedComments] = useState(0);
    const [user, setUser] = useState<IUserFields>({ agency: "Riverside Police Department", badgeId: "4471", name: "Sgt. Rivera", rank: "Sergeant" });

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

    /** An input for one thing about the user. */
    const userInput = (field: keyof IUserFields, label: string): React.JSX.Element => (
        <div>
            <label className="form-label" htmlFor={`review-demo-${field}`}>{label}</label>
            <input
                id={`review-demo-${field}`}
                className="form-control"
                value={user[field]}
                onChange={(e) => setUser(current => ({ ...current, [field]: e.target.value }))}
            />
        </div>
    );

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
                {userInput("name", "User")}
                {userInput("badgeId", "Badge ID")}
                {userInput("rank", "Rank")}
                {userInput("agency", "Agency")}
            </div>
            <div className="text-muted mb-3">{roles[role].description} The host holds {savedComments} comment(s) and {savedAudit} audit record(s).</div>
            {/* keyed on the role because the mode is applied as the form loads; the comments and the history survive the reload in the host's store */}
            <ReportViewer
                key={role}
                identity={catalogIdentity}
                dataManager={dataManager}
                settings={{ mode: roles[role].mode, showOptions: true, user: toActor(user) }}
            />
        </div>
    );
}

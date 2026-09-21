import React, { useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { FormMode } from "@forms/core";
import { IReportViewerDataManager, IReviewComment, ReportViewer } from "@forms/report-viewer";

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

/** Demonstrates review: a reviewer's comments on a report, and the officer who reads and resolves them. Both work from the same comments, as a host's database would hold them. */
export default function ReviewDemoPage(): React.JSX.Element {
    const [searchParams, setSearchParams] = useSearchParams();

    const [reviewer, setReviewer] = useState("Sgt. Rivera");
    const [role, setRole] = useState<DemoRole>("reviewer");
    const [savedCount, setSavedCount] = useState(0);

    // stands in for the host's database: it outlives a change of role, so what the reviewer writes is what the officer reads
    const held = useRef<ReadonlyArray<IReviewComment>>([]);

    const dataManager = useMemo((): IReportViewerDataManager => ({
        read: async () => undefined,
        ...createExampleDataManager(catalogIdentity, searchParams, setSearchParams),
        readComments: async () => held.current,
        writeComments: async comments => {
            held.current = comments;
            setSavedCount(comments.length);
        }
    }), [searchParams]);

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
                    <label className="form-label" htmlFor="review-demo-reviewer">Reviewer</label>
                    <input id="review-demo-reviewer" className="form-control" value={reviewer} onChange={(e) => setReviewer(e.target.value)} />
                </div>
                <div className="text-muted mb-2">{roles[role].description} The host holds {savedCount} comment(s).</div>
            </div>
            {/* keyed on the role because the mode is applied as the form loads; the comments survive the reload in the host's store */}
            <ReportViewer
                key={role}
                identity={catalogIdentity}
                dataManager={dataManager}
                settings={{ mode: roles[role].mode, reviewer: reviewer || undefined, showOptions: true }}
            />
        </div>
    );
}

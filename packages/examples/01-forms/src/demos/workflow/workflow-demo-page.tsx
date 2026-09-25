import React, { useMemo, useRef, useState } from "react";
import { FormMode, FormStatus, IWorkflowEntry } from "@forms/core";
import { AuditRecord, IActor, IReportViewerDataManager, IReviewComment, ReportViewer } from "@forms/report-viewer";

import { fry, hermes, whitey } from "../../example-actors";
import { clearExampleData, createExampleDataManager } from "../../example-data";

type DemoForm = "citation" | "crash";
type DemoRole = "officer" | "reviewer" | "viewer";

/** A status a report can arrive at, as the host would hold it. */
interface IArrival {
    readonly label: string;
    readonly status: FormStatus;
}

/** A form the demo moves a report through, and what to tell the user as it goes. */
interface IDemoForm {
    readonly arrivals: ReadonlyArray<IArrival>;
    readonly description: string;
    readonly identity: { readonly name: string; readonly version: string };
    readonly label: string;
    /** Says who should open the report next, and what they can do with it. */
    readonly next: Partial<Record<FormStatus, string>>;
}

const forms: Record<DemoForm, IDemoForm> = {
    citation: {
        arrivals: [
            { label: "Draft", status: "draft" },
            { label: "Issued", status: "issued" }
        ],
        description: "A citation goes from draft to issued in a single move, by the officer. In South Carolina issuing closes only what the citation charges -- the violations, where they were, and the pages carrying them -- and the officer can correct the rest until the court takes it.",
        identity: { name: "S438 Citation Form", version: "1.0" },
        label: "Citation (S438)",
        next: {
            draft: "Open it as the Officer, and issue it.",
            issued: "Issued. Open it as the Officer to see what can still be corrected, and as the Viewer to see it as the court does."
        }
    },
    crash: {
        arrivals: [
            { label: "Draft", status: "draft" },
            { label: "In progress", status: "inProgress" },
            { label: "In review", status: "inReview" }
        ],
        description: "A crash report takes more than one person to get from draft to approved, and each of them opens it as it stands and moves it once: the officer submits it, then the reviewer approves it, or comments and rejects it for the officer to fix and submit again.",
        identity: { name: "SC TR-310 - Traffic Collision Report", version: "1.0" },
        label: "Crash report (TR-310)",
        next: {
            approved: "Approved. There is nothing more to do; open it as the Viewer to read it.",
            draft: "Open it as the Officer, and submit it for review.",
            inProgress: "Open it as the Officer, and submit it for review.",
            inReview: "Open it as the Reviewer, and approve it once every comment is resolved -- or add a comment, and reject it.",
            rejected: "Open it as the Officer, fix what the comments say, resolve each one, and submit it again -- resubmitting stays blocked while any comment is open."
        }
    }
};

/** Who opens the report in each role, the mode the report viewer shows it in, and what that lets them do. */
const roles: Record<DemoRole, { readonly actor: IActor; readonly description: string; readonly label: string; readonly mode: FormMode }> = {
    officer: {
        actor: fry,
        description: "Editable: the officer writes the report and makes the moves an author makes -- submitting a report, issuing a citation.",
        label: "Officer",
        mode: "editable"
    },
    reviewer: {
        actor: hermes,
        description: "Reviewable: the reviewer comments, and makes the moves a reviewer makes -- approving, or rejecting once there is a comment to fix.",
        label: "Reviewer",
        mode: "reviewable"
    },
    viewer: {
        actor: whitey,
        description: "Viewable: the report as a printed copy shows it, with nothing to change.",
        label: "Viewer",
        mode: "viewable"
    }
};

/** What the host holds of the report's place in its workflow. */
interface IHeldReport {
    readonly history: ReadonlyArray<IWorkflowEntry>;
    readonly status: FormStatus;
}

/** Spells a status out: "inReview" reads "in review". */
function toWords(status: string): string {
    return status.replace(/([A-Z])/g, " $1").toLowerCase();
}

/**
 * Demonstrates a report's workflow. A report reaches the report viewer in one status and leaves it in another, moved
 * once, so a report that takes several people to finish is opened again for each of them -- the host keeps it between
 * times, as its database would, and the page shows what it holds.
 */
export default function WorkflowDemoPage(): React.JSX.Element {
    const [formKey, setFormKey] = useState<DemoForm>("crash");
    const [arrival, setArrival] = useState<FormStatus>("draft");
    const [role, setRole] = useState<DemoRole>("officer");
    const [held, setHeld] = useState<IHeldReport | undefined>();
    const [savedAudit, setSavedAudit] = useState(0);
    const [savedComments, setSavedComments] = useState(0);
    // bumped to start the report over, since the viewer only reads its record as it loads
    const [session, setSession] = useState(0);

    // stand in for the host's database: they outlive a change of role, so what one person leaves is what the next finds
    const audit = useRef<ReadonlyArray<AuditRecord>>([]);
    const comments = useRef<ReadonlyArray<IReviewComment>>([]);

    const demoForm = forms[formKey];

    const dataManager = useMemo((): IReportViewerDataManager | undefined => {
        // always the full fixture, so there is a valid report to move -- a blank one has errors that stop every move
        const record = createExampleDataManager(demoForm.identity, new URLSearchParams({ record: "full" }), () => undefined);

        if (!record) {
            return undefined;
        }

        return {
            ...record,
            read: async reason => {
                const result = await record.read(reason);

                if (!result) {
                    return undefined;
                }

                // a report the host has kept carries its own status; one it has not arrives as the one chosen here
                const status = result.status ?? arrival;
                setHeld({ history: result.workflow?.history ?? [], status });

                return { ...result, audit: audit.current, comments: comments.current, status };
            },
            write: async data => {
                await record.write!(data);
                setHeld({ history: data.workflow?.history ?? [], status: data.status });
            },
            // append-only: the records are new to the host, matched by id, so a record handed over twice is kept once
            writeAudit: async records => {
                const known = new Set(audit.current.map(kept => kept.id));

                audit.current = [...audit.current, ...records.filter(added => !known.has(added.id))];
                setSavedAudit(audit.current.length);
            },
            writeComments: async next => {
                comments.current = next;
                setSavedComments(next.length);
            }
        };
    }, [demoForm, arrival, session]);

    /** Puts the report back as it first arrived, forgetting what was kept for it. */
    const startOver = (nextForm: DemoForm = formKey, nextArrival: FormStatus = arrival): void => {
        clearExampleData(forms[nextForm].identity);
        audit.current = [];
        comments.current = [];
        setSavedAudit(0);
        setSavedComments(0);
        setHeld(undefined);
        setFormKey(nextForm);
        setArrival(nextArrival);
        setSession(current => current + 1);
    };

    const changeForm = (nextForm: DemoForm): void => {
        // the report is a different one, so it arrives at the first status this form offers, as a new one
        startOver(nextForm, forms[nextForm].arrivals[0].status);
        setRole("officer");
    };

    const next = held && demoForm.next[held.status];

    return (
        <div className="d-flex flex-column">
            <div className="d-flex align-items-end mb-3" style={{ gap: "1rem" }}>
                <div>
                    <label className="form-label" htmlFor="workflow-demo-form">Form</label>
                    <select id="workflow-demo-form" className="form-select" value={formKey} onChange={(e) => changeForm(e.target.value as DemoForm)}>
                        {(Object.keys(forms) as Array<DemoForm>).map((key) => <option key={key} value={key}>{forms[key].label}</option>)}
                    </select>
                </div>
                <div>
                    <label className="form-label" htmlFor="workflow-demo-arrival">Arrives as</label>
                    <select id="workflow-demo-arrival" className="form-select" value={arrival} onChange={(e) => startOver(formKey, e.target.value as FormStatus)}>
                        {demoForm.arrivals.map(({ label, status }) => <option key={status} value={status}>{label}</option>)}
                    </select>
                </div>
                <div>
                    <label className="form-label" htmlFor="workflow-demo-role">Open it as</label>
                    <select id="workflow-demo-role" className="form-select" value={role} onChange={(e) => setRole(e.target.value as DemoRole)}>
                        {(Object.keys(roles) as Array<DemoRole>).map((key) => <option key={key} value={key}>{roles[key].label}</option>)}
                    </select>
                </div>
                <button id="workflow-demo-start-over" type="button" className="btn btn-outline-secondary" onClick={() => startOver()}>Start over</button>
            </div>
            <div className="text-muted mb-2">{demoForm.description}</div>
            <div className="text-muted mb-3">{roles[role].description}</div>
            <div id="workflow-demo-held" className="border rounded p-3 mb-3">
                <div>
                    The host holds the report as <strong>{held ? toWords(held.status) : "…"}</strong>, with {savedComments} comment(s) and {savedAudit} audit record(s).
                    {next && <> <span className="fw-semibold">{next}</span></>}
                </div>
                {held && held.history.length > 0 && (
                    <table className="table table-sm mt-2 mb-0">
                        <thead>
                            <tr><th>Moved</th><th>By</th><th>When</th></tr>
                        </thead>
                        <tbody>
                            {held.history.map((entry) => (
                                <tr key={`${entry.at}:${entry.transition}`}>
                                    <td>{entry.transition}: {toWords(entry.from)} → {toWords(entry.to)}</td>
                                    <td>{entry.by.name}{entry.by.rank ? `, ${entry.by.rank}` : ""}</td>
                                    <td>{new Date(entry.at).toLocaleTimeString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            {/* keyed so that the report is read again as it now stands: the mode and the user are applied as it loads */}
            <ReportViewer
                key={`${formKey}:${role}:${session}`}
                identity={demoForm.identity}
                dataManager={dataManager}
                settings={{ mode: roles[role].mode, showOptions: true, user: roles[role].actor }}
            />
        </div>
    );
}

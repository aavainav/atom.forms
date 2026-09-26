import React, { useEffect, useRef, useState } from "react";
import { useService } from "@common/react";
import { FButton, FCode, FListGroup, FListGroupItem, FormMode, FormStatus } from "@forms/core";
import { AuditRecord, IAuditService } from "@forms/report-viewer";

/** How many records the log keeps; the oldest fall off. */
const maxLoggedRecords = 200;

/** The badge colour each kind of record is shown in. */
const kindColours: Record<AuditRecord["kind"], string> = {
    "comment-added": "info",
    "comment-reopened": "warning",
    "comment-resolved": "success",
    "dropped": "primary",
    "fields-edited": "primary",
    "form-closed": "secondary",
    "form-loaded": "secondary",
    "form-opened": "secondary",
    "form-restored": "secondary",
    "form-started": "secondary",
    "page-added": "secondary",
    "page-focused": "light",
    "page-removed": "danger",
    "preset-applied": "primary",
    "preset-deleted": "danger",
    "preset-saved": "primary",
    "preset-skipped": "secondary",
    "print-ended": "info",
    "print-started": "info",
    "report-data-copied": "warning",
    "report-data-viewed": "light",
    "save-failed": "danger",
    "saved": "success",
    "status-changed": "dark",
    "validated": "warning",
    "violations-added": "primary",
    "workflow-transition": "dark"
};

interface ILoggedRecord {
    readonly id: number;
    readonly record: AuditRecord;
}

/** Describes where a form stood when it was shown, in a line. */
function describeShown({ form, mode, status }: { readonly form: { readonly name: string; readonly version: string }; readonly mode: FormMode; readonly status: FormStatus }): string {
    return `${form.name} v${form.version}, ${status}${mode === "editable" ? "" : `, ${mode}`}`;
}

/** Describes what a record is about, in a line. */
function summarize(record: AuditRecord): string {
    switch (record.kind) {
        case "comment-added":
        case "comment-reopened":
        case "comment-resolved":
            return record.target;
        case "dropped":
            return `${record.type}: ${record.fields.join(", ")}`;
        case "fields-edited":
            return record.fields.join(", ");
        case "page-added":
        case "page-removed":
            return `${record.page} ${record.pageOrdinal + 1}: ${record.fields.join(", ")}`;
        case "page-focused":
            return `${record.page} ${record.pageOrdinal + 1}`;
        case "violations-added":
            return `${record.codes.join(", ")}: ${record.fields.join(", ")}`;
        case "form-closed":
            return `${record.status}${record.isDirty ? ", unsaved changes" : ""}`;
        case "form-loaded":
            return `${describeShown(record)}, ${record.auditRecords} audit record(s), ${record.comments} comment(s), ${record.transitions} transition(s)`;
        case "form-opened":
        case "form-restored":
            return describeShown(record);
        case "form-started":
            return `${describeShown(record)}, ${record.reason === "new" ? `a new form${record.template ? ` from the ${record.template} template` : ""}` : "nothing to load"}`;
        case "preset-applied":
        case "preset-saved":
            return `${record.preset}: ${record.fields.join(", ")}`;
        case "preset-deleted":
            return record.preset;
        case "preset-skipped":
            return `${record.preset}: ${record.field} (${record.reason})`;
        case "print-started":
            return `${record.layout}: ${record.pageNames?.join(", ") ?? "all pages"}`;
        case "report-data-copied":
        case "report-data-viewed":
            return record.tab;
        case "status-changed":
            return `${record.from} → ${record.to}`;
        case "workflow-transition":
            return `${record.transition}: ${record.from} → ${record.to}${record.note ? ` (${record.note})` : ""}`;
        case "validated":
            return record.issueCount ? `${record.issueCount} issue(s): ${record.fields.join(", ")}` : "No issues.";
        default:
            return "";
    }
}

interface IAuditLogProps {
    /** The kinds of record to show. Every kind is shown when it is left out; the kinds not shown are still kept, and come back when it changes. */
    readonly kinds?: ReadonlyArray<AuditRecord["kind"]>;
}

/** Lists the records the audit service hands out, newest first. */
export default function AuditLog({ kinds }: IAuditLogProps = {}): React.JSX.Element {
    const auditService = useService<IAuditService>(IAuditService);
    const [records, setRecords] = useState<ReadonlyArray<ILoggedRecord>>([]);
    const nextId = useRef(0);

    const shown = kinds ? records.filter(({ record }) => kinds.includes(record.kind)) : records;

    useEffect(() => {
        const listener = auditService.onRecord(record => {
            setRecords(current => [{ id: nextId.current++, record }, ...current].slice(0, maxLoggedRecords));
        });

        return () => listener.remove();
    }, [auditService]);

    return (
        <div className="position-sticky" style={{ top: "1rem" }}>
            <div className="d-flex justify-content-between align-items-center mb-1">
                <h6 className="mb-0">
                    Audit log
                    <span className="badge text-bg-light fw-normal ms-2">{shown.length}</span>
                </h6>
                <FButton size="small" variant="outline-secondary" text="Clear" disabled={!records.length} onClick={() => setRecords([])} />
            </div>
            <p className="text-muted small">Records name the fields touched, never what they held.</p>
            <div style={{ maxHeight: "calc(100vh - 9rem)", overflowY: "auto" }}>
                {shown.length === 0 && <div className="text-muted small">{records.length === 0 ? "Nothing recorded yet." : "Nothing of the kinds shown yet."}</div>}
                <FListGroup>
                    {shown.map(({ id, record }) => (
                        <FListGroupItem key={id}>
                            <div className="d-flex justify-content-between align-items-center">
                                <span className={`badge text-bg-${kindColours[record.kind]}`}>{record.kind}</span>
                                <span className="text-muted small font-monospace">
                                    {new Date(record.at).toLocaleTimeString()} · {record.form.id.slice(0, 8)}
                                </span>
                            </div>
                            <div className="small fw-semibold">
                                {record.form.name}
                                {record.by && <span className="fw-normal text-muted"> · {record.by.name}</span>}
                            </div>
                            <div className="small text-break">{summarize(record)}</div>
                            <details className="small">
                                <summary className="text-muted">Raw record</summary>
                                <FCode>{JSON.stringify(record, null, 2)}</FCode>
                            </details>
                        </FListGroupItem>
                    ))}
                </FListGroup>
            </div>
        </div>
    );
}

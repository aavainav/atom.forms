import React, { useEffect, useRef, useState } from "react";
import { useService } from "@common/react";
import { FButton, FCode, FListGroup, FListGroupItem } from "@forms/core";
import { AuditRecord, IAuditService } from "@forms/report-viewer";

/** How many records the log keeps; the oldest fall off. */
const maxLoggedRecords = 200;

/** The badge colour each kind of record is shown in. */
const kindColours: Record<AuditRecord["kind"], string> = {
    "fields-edited": "primary",
    "form-opened": "secondary",
    "print-ended": "info",
    "print-started": "info",
    "save-failed": "danger",
    "saved": "success",
    "status-changed": "dark",
    "validated": "warning"
};

interface ILoggedRecord {
    readonly id: number;
    readonly record: AuditRecord;
}

/** Describes what a record is about, in a line. */
function summarize(record: AuditRecord): string {
    switch (record.kind) {
        case "fields-edited":
            return record.fields.join(", ");
        case "form-opened":
            return `${record.form.name} v${record.form.version}, ${record.status}${record.mode === "viewable" ? ", viewable" : ""}`;
        case "print-started":
            return `${record.layout}: ${record.pageNames?.join(", ") ?? "all pages"}`;
        case "status-changed":
            return `${record.from} → ${record.to}`;
        case "validated":
            return record.issueCount ? `${record.issueCount} issue(s): ${record.fields.join(", ")}` : "No issues.";
        default:
            return "";
    }
}

/** Lists the records the audit service hands out, newest first. */
export default function AuditLog(): React.JSX.Element {
    const auditService = useService<IAuditService>(IAuditService);
    const [records, setRecords] = useState<ReadonlyArray<ILoggedRecord>>([]);
    const nextId = useRef(0);

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
                    <span className="badge text-bg-light fw-normal ms-2">{records.length}</span>
                </h6>
                <FButton size="small" variant="outline-secondary" text="Clear" disabled={!records.length} onClick={() => setRecords([])} />
            </div>
            <p className="text-muted small">Records name the fields touched, never what they held.</p>
            <div style={{ maxHeight: "calc(100vh - 9rem)", overflowY: "auto" }}>
                {records.length === 0 && <div className="text-muted small">Nothing recorded yet.</div>}
                <FListGroup>
                    {records.map(({ id, record }) => (
                        <FListGroupItem key={id}>
                            <div className="d-flex justify-content-between align-items-center">
                                <span className={`badge text-bg-${kindColours[record.kind]}`}>{record.kind}</span>
                                <span className="text-muted small font-monospace">
                                    {new Date(record.at).toLocaleTimeString()} · {record.form.id.slice(0, 8)}
                                </span>
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

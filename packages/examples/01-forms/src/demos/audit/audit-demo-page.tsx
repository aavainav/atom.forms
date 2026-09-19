import React, { useMemo } from "react";
import { useSearchParams } from "react-router";
import { ReportViewer } from "@forms/report-viewer";

import AuditLog from "./audit-log";
import { createExampleDataManager } from "../../example-data";

/** The catalog form the demo audits. S438 repeats its front page per charge, so adding one shows a record being added. */
const catalogIdentity = { name: "S438 Citation Form", version: "1.0" };

/** Demonstrates what the audit records as a form is worked on, listed live beside it. */
export default function AuditDemoPage(): React.JSX.Element {
    const [searchParams, setSearchParams] = useSearchParams();

    const dataManager = useMemo(() => createExampleDataManager(catalogIdentity, searchParams, setSearchParams), [searchParams]);

    return (
        <div className="d-flex flex-column">
            <div className="d-flex align-items-start" style={{ gap: "1rem" }}>
                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <ReportViewer identity={catalogIdentity} dataManager={dataManager} settings={{ showOptions: true }} />
                </div>
                <div style={{ width: 380, flexShrink: 0 }}>
                    <AuditLog />
                </div>
            </div>
        </div>
    );
}

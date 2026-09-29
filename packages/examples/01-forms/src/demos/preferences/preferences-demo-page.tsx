import React, { useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { IActor, IReportViewerComponent, ReportViewer } from "@forms/report-viewer";

import PreferencesLog from "./preferences-log";
import { createExampleDataManager } from "../../example-data";

const identity = { name: "S438 Citation Form", version: "1.0" };
const officer: IActor = { agency: "Planet Express", badgeId: "2999", id: "fry", name: "Philip J. Fry", rank: "Delivery Boy" };

/**
 * Demonstrates `IReportViewerComponent.onPreferencesChanged`: star a violation in the S438's violation selector, and
 * the value it raises appears in the log beside it. No `preferences` is given here, so favorites are also loaded
 * from and saved to this browser's own storage -- reloading the page keeps them.
 */
export default function PreferencesDemoPage(): React.JSX.Element {
    const [searchParams, setSearchParams] = useSearchParams();
    const [component, setComponent] = useState<IReportViewerComponent | null>(null);

    const dataManager = useMemo(() => createExampleDataManager(identity, searchParams, setSearchParams), [searchParams]);

    return (
        <div className="d-flex align-items-start" style={{ gap: "1rem" }}>
            <div className="flex-grow-1" style={{ minWidth: 0 }}>
                <ReportViewer
                    ref={setComponent}
                    identity={identity}
                    dataManager={dataManager}
                    settings={{ showOptions: true, user: officer }}
                />
            </div>
            <div style={{ width: 380, flexShrink: 0 }}>
                <PreferencesLog component={component} />
            </div>
        </div>
    );
}

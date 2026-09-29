import React, { useEffect, useRef, useState } from "react";
import { FButton, FCode, FListGroup, FListGroupItem } from "@forms/core";
import { IReportViewerComponent, IUserPreferences } from "@forms/report-viewer";

interface ILoggedChange {
    readonly id: number;
    readonly preferences: IUserPreferences;
}

interface IPreferencesLogProps {
    /** The mounted report viewer's imperative handle, once the form beside this log has loaded; null before then. */
    readonly component: IReportViewerComponent | null;
}

/** Lists every value `onPreferencesChanged` has raised, newest first -- exactly what a host's own `ref` would receive. */
export default function PreferencesLog({ component }: IPreferencesLogProps): React.JSX.Element {
    const [changes, setChanges] = useState<ReadonlyArray<ILoggedChange>>([]);
    const nextId = useRef(0);

    useEffect(() => {
        if (!component) {
            return;
        }

        const listener = component.onPreferencesChanged(preferences => {
            setChanges(current => [{ id: nextId.current++, preferences }, ...current]);
        });

        return () => listener.remove();
    }, [component]);

    return (
        <div className="position-sticky" style={{ top: "1rem" }}>
            <div className="d-flex justify-content-between align-items-center mb-1">
                <h6 className="mb-0">
                    Preferences log
                    <span className="badge text-bg-light fw-normal ms-2">{changes.length}</span>
                </h6>
                <FButton size="small" variant="outline-secondary" text="Clear" disabled={!changes.length} onClick={() => setChanges([])} />
            </div>
            <p className="text-muted small">Star a violation in the selector to see the change raised here.</p>
            <div style={{ maxHeight: "calc(100vh - 9rem)", overflowY: "auto" }}>
                {changes.length === 0 && <div className="text-muted small">Nothing raised yet.</div>}
                <FListGroup>
                    {changes.map(({ id, preferences }) => (
                        <FListGroupItem key={id}>
                            <FCode>{JSON.stringify(preferences, null, 2)}</FCode>
                        </FListGroupItem>
                    ))}
                </FListGroup>
            </div>
        </div>
    );
}

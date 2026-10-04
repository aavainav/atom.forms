import React, { useState } from "react";
import { FBadge, FBadgeVariant, FButton, FCode, FListGroup, FListGroupItem } from "@forms/core";

/** Where an event comes from: what the host hooks into to hear it. */
export type EventSource = "Data manager" | "Component" | "Controller" | "Service";

/** One thing the report viewer told the host, as the log shows it. */
export interface ILoggedEvent {
    readonly at: Date;
    readonly id: number;
    readonly name: string;
    /** Raised so often, such as on every keystroke, that it is hidden unless asked for. */
    readonly isNoisy?: boolean;
    readonly payload?: unknown;
    readonly source: EventSource;
}

interface IEventLogProps {
    readonly entries: ReadonlyArray<ILoggedEvent>;
    /** Whether new events are being left out of the log. */
    readonly isPaused: boolean;

    onClear: () => void;
    onTogglePause: () => void;
}

const sources: ReadonlyArray<EventSource> = ["Data manager", "Component", "Controller", "Service"];

const variants: Record<EventSource, FBadgeVariant> = {
    "Component": "info",
    "Controller": "success",
    "Data manager": "primary",
    "Service": "warning"
};

/** Lists what the report viewer raised, newest first, narrowed to the sources chosen. */
export default function EventLog({ entries, isPaused, onClear, onTogglePause }: IEventLogProps): React.JSX.Element {
    const [shown, setShown] = useState<ReadonlySet<EventSource>>(new Set(sources));
    const [showNoisy, setShowNoisy] = useState(false);

    const toggle = (source: EventSource): void => setShown(current => {
        const next = new Set(current);

        if (!next.delete(source)) {
            next.add(source);
        }

        return next;
    });

    const visible = entries.filter(entry => shown.has(entry.source) && (showNoisy || !entry.isNoisy));

    return (
        <div id="event-log">
            <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0">
                    Event log
                    <span className="badge text-bg-light fw-normal ms-2">{visible.length}</span>
                </h6>
                <div className="d-flex" style={{ gap: ".25rem" }}>
                    <FButton id="event-log-pause" size="small" variant="outline-secondary" text={isPaused ? "Resume" : "Pause"} onClick={onTogglePause} />
                    <FButton id="event-log-clear" size="small" variant="outline-secondary" text="Clear" disabled={!entries.length} onClick={onClear} />
                </div>
            </div>
            <div className="d-flex flex-wrap mb-2" style={{ gap: ".25rem" }}>
                {sources.map(source => (
                    <FButton key={source} size="small" variant={shown.has(source) ? "secondary" : "outline-secondary"} text={source} onClick={() => toggle(source)} />
                ))}
                <FButton id="event-log-noisy" size="small" variant={showNoisy ? "secondary" : "outline-secondary"} text="Noisy" onClick={() => setShowNoisy(current => !current)} />
            </div>
            <div style={{ maxHeight: "calc(100vh - 16rem)", overflowY: "auto" }}>
                {visible.length === 0 && <div className="text-muted small">Nothing raised yet. Try something on the form.</div>}
                <FListGroup>
                    {visible.map(entry => (
                        <FListGroupItem key={entry.id}>
                            <div className="d-flex justify-content-between align-items-center">
                                <span>
                                    <FBadge variant={variants[entry.source]}>{entry.source}</FBadge>
                                    <span className="fw-semibold ms-2">{entry.name}</span>
                                </span>
                                <small className="text-muted">{entry.at.toLocaleTimeString()}</small>
                            </div>
                            {entry.payload !== undefined && (
                                <details>
                                    <summary className="small text-muted">Payload</summary>
                                    <FCode>{JSON.stringify(entry.payload, null, 2)}</FCode>
                                </details>
                            )}
                        </FListGroupItem>
                    ))}
                </FListGroup>
            </div>
        </div>
    );
}

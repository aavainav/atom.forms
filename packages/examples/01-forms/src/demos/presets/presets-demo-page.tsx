import React, { useEffect, useMemo, useState } from "react";
import { AuditRecord, IReportPreset, IReportViewerDataManager, ReportViewer } from "@forms/report-viewer";

import { fry } from "../../example-actors";
import { clearExampleData, clearExamplePresets, createExampleDataManager } from "../../example-data";
import AuditLog from "../audit/audit-log";

type DemoForm = "gautc" | "s438" | "sc432" | "tr310";
type DemoStart = "full" | "minimal" | "new";

/** A form the demo applies presets to, and what to call it in the switcher. */
interface IDemoForm {
    readonly identity: { readonly name: string; readonly version: string };
    readonly label: string;
}

/** What the report holds when it opens, and what that is good for trying. */
interface IDemoStart {
    readonly description: string;
    readonly label: string;
}

const forms: Record<DemoForm, IDemoForm> = {
    gautc: { identity: { name: "GA Uniform Traffic Citation", version: "1.0" }, label: "Georgia citation (GA UTC)" },
    s438: { identity: { name: "S438 Citation Form", version: "1.0" }, label: "Citation (S438)" },
    sc432: { identity: { name: "SC Form 432 - Public Contact / Warning", version: "1.0" }, label: "Public contact / warning (SC 432)" },
    tr310: { identity: { name: "SC TR-310 - Traffic Collision Report", version: "1.0" }, label: "Crash report (TR-310)" }
};

const starts: Record<DemoStart, IDemoStart> = {
    full: {
        description: "Every section is answered, so a preset leaves nearly all it carries alone, and overwrite mode is what changes anything.",
        label: "A well-written report"
    },
    minimal: {
        description: "Only what the form requires is answered, so a preset fills the rest in and leaves those fields alone, saying they are answered.",
        label: "A partly written report"
    },
    new: {
        description: "The form's default: where SC 432 and S438 lock a value, such as the agency or the court, a preset that carries it leaves it alone, whatever the mode.",
        label: "A new report"
    }
};

/** The kinds of record a preset raises, which the log narrows to when asked. */
const presetKinds: ReadonlyArray<AuditRecord["kind"]> = ["preset-applied", "preset-deleted", "preset-saved", "preset-skipped"];

/** What a preset sets, in a line: its fields, and a list of pages by how many it holds. */
function describeData(data: Record<string, unknown>): string {
    return Object.entries(data)
        .map(([key, value]) => Array.isArray(value) ? `${key} (${value.length} ${value.length === 1 ? "page" : "pages"})` : key)
        .join(", ");
}

/** What a preset locks: the fields it marks. */
function describeLocks(readOnlyFields: object | undefined): string {
    return readOnlyFields ? Object.keys(readOnlyFields).join(", ") : "";
}

/**
 * Demonstrates presets: named data an officer applies to a report already under way, and saves from one. The page
 * opens a report in a chosen state, lists the presets the host gives for it beside what each sets and locks, and keeps
 * the audit log running beside the report -- narrowed to the records a preset raises -- so what applying one did, what
 * it left alone and why can be read as it happens. Presets only apply to a report that can be edited, so the report is
 * always opened as the officer.
 */
export default function PresetsDemoPage(): React.JSX.Element {
    const [formKey, setFormKey] = useState<DemoForm>("sc432");
    const [onlyPresetRecords, setOnlyPresetRecords] = useState(true);
    const [presets, setPresets] = useState<ReadonlyArray<IReportPreset<any>>>([]);
    // bumped when the officer's presets change, so the table follows what the panel does
    const [presetChanges, setPresetChanges] = useState(0);
    // bumped to open the report again, since the viewer only reads its record as it loads
    const [session, setSession] = useState(0);
    const [start, setStart] = useState<DemoStart>("new");

    const demoForm = forms[formKey];

    const dataManager = useMemo((): IReportViewerDataManager | undefined => {
        const record = createExampleDataManager(demoForm.identity, new URLSearchParams({ record: start }), () => undefined);

        if (!record) {
            return undefined;
        }

        return {
            ...record,
            deletePreset: async id => {
                await record.deletePreset!(id);
                setPresetChanges(current => current + 1);
            },
            writePreset: async preset => {
                await record.writePreset!(preset);
                setPresetChanges(current => current + 1);
            }
        };
    }, [demoForm, start, session]);

    useEffect(() => {
        let isCurrent = true;

        (dataManager?.readPresets?.() ?? Promise.resolve([])).then(result => {
            if (isCurrent) {
                setPresets(result);
            }
        });

        return () => { isCurrent = false; };
    }, [dataManager, presetChanges]);

    /** Puts the report back as it opens, forgetting what was saved for it; the officer's presets are kept. */
    const startOver = (nextForm: DemoForm = formKey, nextStart: DemoStart = start): void => {
        clearExampleData(forms[nextForm].identity);
        setFormKey(nextForm);
        setStart(nextStart);
        setSession(current => current + 1);
    };

    const clearPresets = (): void => {
        clearExamplePresets(demoForm.identity);
        setPresetChanges(current => current + 1);
    };

    return (
        <div className="d-flex flex-column">
            <div className="d-flex align-items-end mb-3" style={{ gap: "1rem" }}>
                <div>
                    <label className="form-label" htmlFor="presets-demo-form">Form</label>
                    <select id="presets-demo-form" className="form-select" value={formKey} onChange={(e) => startOver(e.target.value as DemoForm)}>
                        {(Object.keys(forms) as Array<DemoForm>).map((key) => <option key={key} value={key}>{forms[key].label}</option>)}
                    </select>
                </div>
                <div>
                    <label className="form-label" htmlFor="presets-demo-start">Start from</label>
                    <select id="presets-demo-start" className="form-select" value={start} onChange={(e) => startOver(formKey, e.target.value as DemoStart)}>
                        {(Object.keys(starts) as Array<DemoStart>).map((key) => <option key={key} value={key}>{starts[key].label}</option>)}
                    </select>
                </div>
                <button id="presets-demo-start-over" type="button" className="btn btn-outline-secondary" onClick={() => startOver()}>Start over</button>
                <button id="presets-demo-clear-presets" type="button" className="btn btn-outline-secondary" onClick={clearPresets}>Clear my presets</button>
                <div className="form-check mb-2">
                    <input id="presets-demo-only-preset-records" type="checkbox" className="form-check-input" checked={onlyPresetRecords} onChange={(e) => setOnlyPresetRecords(e.target.checked)} />
                    <label className="form-check-label" htmlFor="presets-demo-only-preset-records">Only preset records</label>
                </div>
            </div>
            <div className="text-muted mb-3">{starts[start].description} Open the Presets button in the options bar to apply one, or save your own from what is on the page.</div>
            <table id="presets-demo-presets" className="table table-sm mb-3">
                <thead>
                    <tr><th>Preset</th><th>Sets</th><th>Locks</th></tr>
                </thead>
                <tbody>
                    {presets.length === 0 && <tr><td colSpan={3} className="text-muted">No presets for this form yet. Save one from the report.</td></tr>}
                    {presets.map((preset) => (
                        <tr key={preset.id}>
                            <td>
                                {preset.title}
                                {preset.isPersonal && <span className="badge text-bg-light fw-normal ms-2">yours</span>}
                                {preset.group && <div className="text-muted small">{preset.group}</div>}
                            </td>
                            <td className="small">{describeData(preset.data)}</td>
                            <td className="small">{describeLocks(preset.readOnlyFields)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="d-flex align-items-start" style={{ gap: "1rem" }}>
                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    {/* keyed so that the report opens again as it does when a host opens it: its record is read as it loads */}
                    <ReportViewer
                        key={`${formKey}:${start}:${session}`}
                        identity={demoForm.identity}
                        dataManager={dataManager}
                        settings={{ showOptions: true, user: fry }}
                    />
                </div>
                <div style={{ width: 380, flexShrink: 0 }}>
                    <AuditLog kinds={onlyPresetRecords ? presetKinds : undefined} />
                </div>
            </div>
        </div>
    );
}

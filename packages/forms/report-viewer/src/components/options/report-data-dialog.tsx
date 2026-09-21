import React from "react";
import { FCode, FNavTab } from "@forms/core";

/** One tab of the report data dialog: what it is called, and the JSON it shows. */
export interface IReportDataTab {
    /** Identifies the tab. */
    readonly id: string;
    /** The data the tab shows, already formatted for display. */
    readonly json: string;
    /** What the tab is called. */
    readonly title: string;
}

interface IReportDataDialogProps {
    /** The tabs, in the order they are listed. The first shows to begin with. */
    readonly tabs: ReadonlyArray<IReportDataTab>;

    /** Invoked with the tab that is showing each time a different one is selected. */
    onChange: (tab: IReportDataTab) => void;
}

/** Defines the body of the tab pane: the JSON as a code panel, set a little way below the tabs. */
const JsonPane = ({ json }: { readonly json: string }): React.JSX.Element => (
    <FCode margin={{ top: 12 }}>{json}</FCode>
);

/** Defines the body of the report data dialog, showing on separate tabs each kind of data held about the report. */
export const ReportDataDialog = ({ tabs, onChange }: IReportDataDialogProps): React.JSX.Element => (
    <FNavTab
        id="report-data-tabs"
        defaultTab={tabs[0]?.id ?? ""}
        style="tabs"
        pairs={tabs.map(tab => ({
            tab: { name: tab.id, title: tab.title, disabled: false },
            pane: { content: JsonPane, props: { json: tab.json } }
        }))}
        onSelect={id => {
            const selected = tabs.find(tab => tab.id === id);

            if (selected) {
                onChange(selected);
            }
        }}
    />
);

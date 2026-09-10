import React from "react";
import { FCode } from "@forms/core";

interface IReportDataDialogProps {
    /** The report data the form publishes, already formatted for display. */
    readonly json: string;
}

/** Defines the body of the report data dialog, showing the data the current form would be saved as. */
export const ReportDataDialog = ({ json }: IReportDataDialogProps): React.JSX.Element => (
    <FCode>{json}</FCode>
);

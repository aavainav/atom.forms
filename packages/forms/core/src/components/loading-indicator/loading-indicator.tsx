import React from "react";
import FSpinner from "../spinner/spinner";

interface IFLoadingIndicatorProps {
    /** The text shown beneath the spinner, if any. */
    readonly message?: string;
}

/** Defines the loading indicator component. */
export default function FLoadingIndicator({ message }: IFLoadingIndicatorProps): React.JSX.Element {
    return (
        <div className="d-flex flex-column align-items-center justify-content-center gap-2 py-5">
            <FSpinner />
            {message && <span className="text-muted">{message ?? "Loading..."}</span>}
        </div>
    );
}

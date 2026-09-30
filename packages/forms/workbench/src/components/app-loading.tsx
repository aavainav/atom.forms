import React from "react";

/** What the app shows while the first page's route modules are still loading. */
export default function AppLoading(): React.JSX.Element {
    return (
        <div id="app-loading" className="d-flex justify-content-center align-items-center py-5">
            <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );
}

import * as React from "react";

export interface IFPaneProps {
    /** The unique identifier for the tab component. */
    readonly id: string;
    /** The name of the currently active tab. */
    readonly activeTab: string;
}

export const FPane = ({ id, activeTab, children }: React.PropsWithChildren<IFPaneProps>): React.JSX.Element => {
    // TODO: Show a message saying no active tab content to display?
    if (activeTab !== id) {
        return (
            <div></div>
        );
    }

    return (
        <div className="tab-pane active">
            {children}
        </div>
    );
}

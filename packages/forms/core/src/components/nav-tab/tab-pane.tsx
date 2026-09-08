import * as React from "react";
import { useFNavTabs } from "./context";

export interface IFPaneProps {
    /** The unique identifier for the tab component. */
    readonly id: string;
}

export const FPane = ({ id, children }: React.PropsWithChildren<IFPaneProps>): React.JSX.Element => {
    const { activeTab } = useFNavTabs();

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

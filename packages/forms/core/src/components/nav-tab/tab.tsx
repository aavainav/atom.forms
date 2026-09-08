import * as React from "react";
import { useFNavTabs } from "./context";

export interface IFTabProps {
    /** The unique identifier for the tab component. */
    readonly id: string;
    /** The title of the tab. */
    readonly title: string;
    /** Whether the tab is disabled. Default is false. */
    readonly disabled?: boolean;
    /** Whether the tab is currently active. */
    readonly active?: boolean;
}

export const FTab = ({ id, title, disabled = false }: IFTabProps): React.JSX.Element => {
    const { activeTab, setActiveTab } = useFNavTabs();
    const isActive = activeTab === id;

    return (
        <li className="nav-item">
            <button
                className={`nav-link ${isActive ? "active" : ""}`}
                onClick={() => !disabled && setActiveTab(id)}
            >
                {title}
            </button>
        </li>
    );
}

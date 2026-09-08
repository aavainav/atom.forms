import * as React from "react";

export interface IFTabProps {
    /** The unique identifier for the tab component. */
    readonly id: string;
    /** The title of the tab. */
    readonly title: string;
    /** Whether the tab is disabled. Default is false. */
    readonly disabled?: boolean;
    /** The name of the currently active tab. */
    readonly activeTab: string;
    /** Invoked with this tab's id when it is selected. */
    readonly onSelect: (id: string) => void;
}

export const FTab = ({ id, title, disabled = false, activeTab, onSelect }: IFTabProps): React.JSX.Element => {
    const isActive = activeTab === id;

    return (
        <li className="nav-item">
            <button
                className={`nav-link ${isActive ? "active" : ""}`}
                onClick={() => !disabled && onSelect(id)}
            >
                {title}
            </button>
        </li>
    );
}

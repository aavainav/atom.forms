import React, { useState } from "react";

import { FSpinner } from "../spinner";
import { FTab } from "./tab";
import { FPane } from "./tab-pane";

export type NavTabStyle = "tabs" | "pills";

/** Defines the error levels. */
export enum ErrorLevel {
    info = "info",
    warning = "warning",
    error = "error",
    critical = "critical"
}

export interface IFTabError {
    /** The title for the error. */
    readonly title: string;
    /** The message for the error. */
    readonly message: string;
    /** The error level. */
    readonly errorLevel: ErrorLevel;
}

export interface IFTab {
    /** A unique name for the tab. */
    readonly name: string;
    /** A title to display for the tab. */
    readonly title: string;
    /** A flag to indicate if the tab should be disabled or not; default to false. */
    readonly disabled: boolean;
}

export interface IFPane<TProps extends IFPaneContentProps<any>> {
    /** The content to display inside the pane for the navtab. */
    readonly content: React.LazyExoticComponent<React.ComponentType<TProps>>;
    /** The props to pass to the pane component. */
    readonly props?: TProps;
}

export interface IFPaneContentProps<TModel> {
    /** An indication whether the prop resolution was a success or not. */
    readonly success: boolean;
    /** If any issue occurred during the pane model resolution, return the errors to the pane to display. */
    readonly errors?: Array<IFTabError>;
}

interface IFNavTabProps {
    /** The unique identifier for the navtabs. */
    readonly id: string;
    /** The name of the default tab to display. */
    readonly defaultTab: string;
    /** The style of the navigation tabs. Can be either "tabs" or "pills". */
    readonly style: NavTabStyle;
    /** The collection of tab/pane pairs to display in the nav-tab. */
    readonly pairs: Array<IFNavTabPair>;
}

interface IFNavTabPair {
    /** The tab part of the navtabs component. */
    readonly tab: IFTab;
    /** The pane part of the navtabs component. */
    readonly pane: IFPane<any>;
}

export default function FNavTab({ id, defaultTab, pairs, style = "tabs" }: IFNavTabProps): React.JSX.Element {
    const [activeTab, setActiveTab] = useState(defaultTab ?? "");

    return (
        <div id={id}>
            <ul className={`nav nav-${style}`}>
                {pairs.map(pair => (
                    <FNavTab.Tab
                        key={pair.tab.name}
                        id={pair.tab.name}
                        title={pair.tab.title}
                        disabled={pair.tab.disabled}
                        activeTab={activeTab}
                        onSelect={setActiveTab}
                    />
                ))}
            </ul>
            <div className="tab-content">
                {pairs.map(pair => (
                    <FNavTab.Pane key={pair.tab.name} id={pair.tab.name} activeTab={activeTab}>
                        <React.Suspense fallback={<FSpinner size="sm" variant="secondary" />}>
                            {React.createElement(pair.pane.content, pair.pane.props)}
                        </React.Suspense>
                    </FNavTab.Pane>
                ))}
            </div>
        </div>
    );
}

FNavTab.Tab = FTab;
FNavTab.Pane = FPane;

import { createContext, useContext } from "react";

interface IFNavTabsContext {
    /** The name of the active tab. */
    activeTab: string;
    /** The handler for setting the name of the active tab. */
    setActiveTab: (name: string) => void;
}

export const FNavTabsContext = createContext<IFNavTabsContext | undefined>(undefined);

export const useFNavTabs = () => {
    const context = useContext(FNavTabsContext);

    if (!context) {
        throw new Error("Tab components must be used within <FNavTab>");
    }

    return context;
};

import { createContext, useContext } from "react";

interface IFOffCanvasContext {
    /** An indicator on whether or not to show the off canvas component. */
    showOffCanvas: boolean;
    /** The handler for closing the off canvas. */
    hideOffCanvas: () => void;
}

export const FOffCanvasContext = createContext<IFOffCanvasContext | undefined>(undefined);

export const useFOffCanvas = () => {
    const context = useContext(FOffCanvasContext);

    if (!context) {
        throw new Error("Offcanvas header and body components must be used within <FOffCanvas>");
    }

    return context;
};

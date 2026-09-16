import React from "react";

import { FButton } from "../button";
import { FIcon } from "../icon";
import { FWatermark } from "../watermark";

import { FormType } from "../../models/form";
import { buildClasses } from "../../utils/class-names";

interface IFPageProps {
    /** The type of form that is being rendered. */
    readonly formType: FormType;
    /** The content stamped diagonally across the page, from its top left corner to its bottom right; when omitted the page carries no watermark. */
    readonly watermark?: React.ReactNode;
     /** Invoked when adding a new page to the form. */
    onAddPage?: () => void;
    /** Invoked when deleting a page from the form. */
    onDeletePage?: () => void;
}

function getPageClassNames(formType: FormType): Array<string> {
    /** The page class for each form type. A type with no entry, renders as an "f-none" page. */
    const pageTypesByFormType: Partial<Record<FormType, string>> = {
        citation: "f-citation",
        crash: "f-crash",
        warning: "f-warning"
    };

    return [pageTypesByFormType[formType] ?? "f-none", "f-page", "bg-white", "border", "border-dark", "mb-3"];
}

/** Defines the page component. This component wraps the actual page of a form, allowing for functionality to modify pages. */
export const FPage = ({ formType, watermark, children, onAddPage, onDeletePage }: React.PropsWithChildren<IFPageProps>): React.JSX.Element => {
    return (
        // the page is a printed document rather than app chrome: it is white paper with a dark border whichever
        // theme the app is rendered in, so the color mode is pinned here and every control on the page stays
        // legible against it while the chrome around it follows the day/night toggle
        <div data-bs-theme="light" className={buildClasses(...getPageClassNames(formType))}>
            {onDeletePage && (
                <div className="d-flex justify-content-end mb-2">
                    <FButton type="button" className="btn btn-danger" onClick={onDeletePage}>
                        <FIcon icon="x" />
                    </FButton>
                </div>
            )}
            {children}
            {onAddPage && (
                <div className="d-flex justify-content-end mt-2">
                    <FButton type="button" className="btn btn-light" onClick={onAddPage}>
                        <FIcon icon="plus" /> Add Page
                    </FButton>
                </div>
            )}
            {watermark && <FWatermark>{watermark}</FWatermark>}
        </div>
    );
}

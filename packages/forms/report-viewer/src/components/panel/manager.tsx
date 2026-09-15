import React, { lazy, Suspense } from "react";
import { IResolvedFormCatalogItem } from "@forms/catalog";
import { IControllerManager } from "@forms/core";

/**
 * The violations selector, loaded only for a form that declares a violation list -- and only then is the chunk
 * carrying the panel and its list rows fetched at all.
 */
const ViolationsPanel = lazy(() => import("@forms/violations").then(module => ({ default: module.ViolationsPanel })));

interface IPanelManagerProps {
    /** The catalog item the form was loaded from; printing/violations resolve against it. */
    readonly catalogItem: IResolvedFormCatalogItem;
    /** The controllers belonging to the form the panels act on. */
    readonly controllers: IControllerManager;
    /** Reports a panel's failure through the report viewer's notifications. */
    readonly onError: (message: string) => void;
}

/**
 * Defines a manager component for mounting the panels the form offers.
 *
 * The panels are mounted here, at the report viewer's root, rather than inside the options bar: the bar is
 * `position-fixed` and so a stacking context of its own, which ranks anything fixed within it only against the
 * bar's own contents however high its z-index. The modals are under `ModalManager` here for the same reason.
 *
 * A panel is mounted for as long as the form is and decides for itself whether it is showing, which is what lets
 * the option that opens it be a plain button raising an event on a service.
 */
export default function PanelManager({ catalogItem, controllers, onError }: IPanelManagerProps): React.JSX.Element {
    // the violation list is the form's own declaration, decided per-instance rather than off the catalog item
    const violationListId = controllers.getFormController().form.violationListId;

    return (
        <>
            {violationListId && (
                <Suspense fallback={null}>
                    <ViolationsPanel catalogItem={catalogItem} controllers={controllers} onError={onError} />
                </Suspense>
            )}
        </>
    );
}

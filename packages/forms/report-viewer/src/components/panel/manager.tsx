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
 * Mounts the panels a form offers, at the report viewer's root rather than inside the options bar: the bar is
 * `position-fixed`, its own stacking context, which ranks anything fixed inside it only against its own contents
 * regardless of z-index -- `ModalManager` sits here for the same reason.
 *
 * A panel mounts for the form's whole lifetime and decides for itself whether it's showing, which lets the option
 * that opens it be a plain button raising an event on a service.
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

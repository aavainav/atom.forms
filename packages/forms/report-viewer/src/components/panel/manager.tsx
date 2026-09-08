import React from "react";
import { useService } from "@common/react";
import { IFormCatalogItem } from "@forms/catalog";
import { IControllerManager } from "@forms/core";

import { IReportViewerService } from "../../services";

interface IPanelManagerProps {
    /** The catalog item the form was loaded from; a panel may be offered for some forms and not others. */
    readonly catalogItem: IFormCatalogItem;
    /** The controllers belonging to the form the panels act on. */
    readonly controllers: IControllerManager;
}

/**
 * Defines a manager component for mounting the panels registered for the form.
 *
 * The panels are mounted here, at the report viewer's root, rather than inside the options bar: the bar is
 * `position-fixed` and so a stacking context of its own, which ranks anything fixed within it only against the
 * bar's own contents however high its z-index. The modals are under `ModalManager` here for the same reason.
 *
 * A panel is mounted for as long as the form is and decides for itself whether it is showing, which is what lets
 * the option that opens it be a plain button raising an event on a service.
 */
export default function PanelManager({ catalogItem, controllers }: IPanelManagerProps): React.JSX.Element {
    const reportViewerService = useService<IReportViewerService>(IReportViewerService);

    return (
        <>
            {reportViewerService.getPanels(catalogItem).map(({ id, Component }) => (
                <Component key={id} catalogItem={catalogItem} controllers={controllers} />
            ))}
        </>
    );
}

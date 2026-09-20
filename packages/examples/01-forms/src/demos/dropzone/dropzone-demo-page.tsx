import React, { useMemo } from "react";
import { useSearchParams } from "react-router";
import { useService } from "@common/react";
import { ControllerManager, FAsyncLoader, FDraggableItem, IDraggableItem, IImportablePerson, IImportableVehicle } from "@forms/core";
import { IInitialForm, IReportViewerService, ReportViewerForm } from "@forms/report-viewer";

import { dropzoneDemoItems } from "./dropzone-demo-data";
import { createExampleDataManager } from "../../example-data";

/** The catalog form the items are dropped onto. */
const catalogIdentity = { name: "SC Form 432 - Public Contact / Warning", version: "1.0" };

function describeItem(item: IDraggableItem<IImportablePerson | IImportableVehicle>): string {
    if (item.type === "person") {
        const person = item.data as IImportablePerson;
        return `${person.firstName} ${person.lastName}`;
    }

    const vehicle = item.data as IImportableVehicle;
    return `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
}

/**
 * Demonstrates dragging mock person/vehicle records onto the public contact/warning form's dropzones.
 *
 * It takes the long way round -- `loadForm` and `ReportViewerForm` rather than `<ReportViewer />` -- because the
 * draggable items are rendered outside the form and have to share its `DragAndDropController`, which means the page
 * has to own the controllers. That is the one thing `ReportViewer`'s three props deliberately do not expose.
 */
export default function DropzoneDemoPage(): React.JSX.Element {
    const reportViewerService = useService<IReportViewerService>(IReportViewerService);
    const [searchParams, setSearchParams] = useSearchParams();

    // the draggable items are rendered outside the form, so the page owns the controllers and hands the same set to both
    const controllers = useMemo(() => new ControllerManager(), []);
    const dragAndDropController = controllers.getDragAndDropController();

    const dataManager = useMemo(() => createExampleDataManager(catalogIdentity, searchParams, setSearchParams), [searchParams]);

    return (
        <div className="d-flex" style={{ gap: "1rem" }}>
            <div style={{ width: 220, flexShrink: 0 }}>
                <h6>Drag onto the form</h6>
                {dropzoneDemoItems.map((item) => (
                    <FDraggableItem key={item.id} controller={dragAndDropController} itemData={item}>
                        <div className="card mb-2 p-2" style={{ cursor: "grab" }}>{describeItem(item)}</div>
                    </FDraggableItem>
                ))}
            </div>
            <div className="flex-grow-1">
                <FAsyncLoader<IInitialForm> op={() => reportViewerService.loadForm(catalogIdentity, dataManager)}>
                    {(initialForm) => (
                        <ReportViewerForm
                            controllers={controllers}
                            initialForm={initialForm}
                            dataManager={dataManager}
                            mode="editable"
                            showOptions
                        />
                    )}
                </FAsyncLoader>
            </div>
        </div>
    );
}

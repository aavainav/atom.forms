import React, { useMemo } from "react";
import { useSearchParams } from "react-router";
import { useService } from "@common/react";
import { ControllerManager, FApplyButton, FAsyncLoader, FDraggableItem, IDraggableItem, IImportablePerson, IImportableVehicle, IImportableViolation } from "@forms/core";
import { IInitialForm, IReportViewerService, ReportViewerForm } from "@forms/report-viewer";

import { dropzoneDemoItems } from "./dropzone-demo-data";
import { createExampleDataManager } from "../../example-data";

/** The catalog form the items are put onto: its violator and owner both take a person, so applying one offers a choice. */
const catalogIdentity = { name: "S438 Citation Form", version: "1.0" };

function describeItem(item: IDraggableItem<IImportablePerson | IImportableVehicle | IImportableViolation>): string {
    if (item.type === "person") {
        const person = item.data as IImportablePerson;
        return `${person.firstName} ${person.lastName}`;
    }

    if (item.type === "violation") {
        return (item.data as IImportableViolation).description;
    }

    const vehicle = item.data as IImportableVehicle;
    return `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
}

/**
 * Demonstrates putting mock person, vehicle and violation records onto the S438 citation's dropzones, by dragging
 * them or with each one's apply button -- the route for the keyboard and for a touch screen. A person can go onto the
 * violator or the owner, so its button offers both.
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
                <h6>Drag onto the form, or apply</h6>
                {dropzoneDemoItems.map((item) => (
                    <FDraggableItem key={item.id} controller={dragAndDropController} itemData={item}>
                        <div className="card mb-2 p-2" style={{ cursor: "grab" }}>
                            <div className="mb-1">{describeItem(item)}</div>
                            <FApplyButton controllers={controllers} item={item} />
                        </div>
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

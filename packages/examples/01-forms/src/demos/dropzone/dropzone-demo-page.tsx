import React, { useMemo } from "react";
import { ControllerManager, FDraggableItem, IDraggableItem, IImportablePerson, IImportableVehicle } from "@forms/core";
import { PublicContactOrWarningFormLoader } from "@forms/public-contact-or-warning";
import { dropzoneDemoItems } from "./dropzone-demo-data";

function describeItem(item: IDraggableItem<IImportablePerson | IImportableVehicle>): string {
    if (item.type === "person") {
        const person = item.data as IImportablePerson;
        return `${person.firstName} ${person.lastName}`;
    }

    const vehicle = item.data as IImportableVehicle;
    return `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
}

/** Demonstrates dragging mock person/vehicle records onto the public contact/warning form's dropzones. */
export default function DropzoneDemoPage(): React.JSX.Element {
    // the draggable items are rendered outside the form, so the page owns the controllers and hands the same set to both
    const controllers = useMemo(() => new ControllerManager(), []);
    const dragAndDropController = controllers.getDragAndDropController();

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
                <PublicContactOrWarningFormLoader controllers={controllers} />
            </div>
        </div>
    );
}

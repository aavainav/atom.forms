import React from "react";

import { IDragAndDropController } from "../../controllers/drag-and-drop-controller";

import { IDraggableItem } from "../../models/import/draggable-item";
import { IImportablePerson } from "../../models/import/importable-person";
import { IImportableVehicle } from "../../models/import/importable-vehicle";

interface IFDraggableItemProps {
    /** The drag-and-drop controller belonging to the form this item can be dropped onto. */
    readonly controller: IDragAndDropController;
    readonly itemData: IDraggableItem<IImportablePerson | IImportableVehicle>;
}

export default function FDraggableItem({ controller, itemData, children }: React.PropsWithChildren<IFDraggableItemProps>): React.JSX.Element {
    const handleDragStart = (event: React.DragEvent): void => {
        const dataType = `application/f-importable-${itemData.type}`;
        event.dataTransfer.setData(dataType, JSON.stringify(itemData));

        controller.dragStart(itemData);
    };

    return (
        <div draggable onDragStart={handleDragStart} onDragEnd={() => controller.dragEnd()}>
            {children}
        </div>
    );
}

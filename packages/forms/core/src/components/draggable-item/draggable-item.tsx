import React from "react";

import { IDragAndDropController } from "../../controllers/drag-and-drop-controller";

import { IDraggableItem } from "../../models/import/draggable-item";

interface IFDraggableItemProps {
    /** The drag-and-drop controller belonging to the form this item can be dropped onto. */
    readonly controller: IDragAndDropController;
    readonly itemData: IDraggableItem;
    /** Whether the item cannot currently be dragged; a panel offering an item the form has already taken sets this. Default false. */
    readonly disabled?: boolean;
}

export default function FDraggableItem({ controller, itemData, disabled = false, children }: React.PropsWithChildren<IFDraggableItemProps>): React.JSX.Element {
    const handleDragStart = (event: React.DragEvent): void => {
        // `draggable` already refuses the drag, so this is the belt to that brace: a browser that started one
        // anyway would otherwise put the item on the dataTransfer and tell the controller a drag was under way
        if (disabled) {
            event.preventDefault();
            return;
        }

        const dataType = `application/f-importable-${itemData.type}`;
        event.dataTransfer.setData(dataType, JSON.stringify(itemData));

        controller.dragStart(itemData);
    };

    return (
        <div draggable={!disabled} onDragStart={handleDragStart} onDragEnd={() => controller.dragEnd()}>
            {children}
        </div>
    );
}

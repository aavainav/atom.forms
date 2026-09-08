import React, { useEffect, useState } from "react";

import { IDragAndDropController } from "../../controllers/drag-and-drop-controller";

import { IDraggableItem } from "../../models/import/draggable-item";
import { Dropzone } from "../../models/import/dropzone";
import { DropzoneHelper } from "../../models/import/dropzone-helper";

import { buildClasses } from "../../utils/class-names";

interface IFDropzoneProps {
    /** The form's drag-and-drop controller, used to track the item currently being dragged. */
    readonly controller: IDragAndDropController;
    /** The dropzone this drop target renders; its own type decides which dragged items it accepts. */
    readonly dropzone: Dropzone;
    /** Invoked with the updated dropzone once an item has been dropped; the caller is responsible for storing it back onto the owning page. */
    onDrop?: (dropzone: Dropzone) => void;
}

export default function FDropzone({ controller, dropzone, children, onDrop }: React.PropsWithChildren<IFDropzoneProps>): React.JSX.Element {
    const [draggingItem, setDraggingItem] = useState<IDraggableItem>();

    useEffect(() => {
        const startListener = controller.onDragStart(setDraggingItem);
        const endListener = controller.onDragEnd(() => setDraggingItem(undefined));

        return () => {
            startListener.remove();
            endListener.remove();
        };
    }, [controller]);

    const isDragging = draggingItem !== undefined;
    const isValid = !draggingItem || draggingItem.type === dropzone.type;

    const handleDrop = (event: React.DragEvent): void => {
        event.preventDefault();

        const data = event.dataTransfer.getData(`application/f-importable-${dropzone.type}`);
        if (!data) {
            return;
        }

        const item = JSON.parse(data) as IDraggableItem;

        // the helper picks the schema off the item's own type, so this asks once rather than once per importable
        if (DropzoneHelper.isValidType(item)) {
            onDrop?.(dropzone.onDrop(item.data));
        }
    };

    return (
        <div
            className={buildClasses(isDragging ? "dropzone-dragging" : "", !isValid ? "dropzone-invalid" : "")}
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
        >
            {children}
        </div>
    );
}

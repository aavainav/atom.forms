import React, { useEffect, useState } from "react";

import { IDragAndDropController } from "../../controllers/drag-and-drop-controller";
import { IPageBinding } from "../../controllers/form-controller";

import { IDraggableItem } from "../../models/import/draggable-item";
import { Dropzone } from "../../models/import/dropzone";
import { DropzoneHelper } from "../../models/import/dropzone-helper";
import { SectionDefinition } from "../../models/section-definition";

import { buildClasses } from "../../utils/class-names";

interface IFDropzoneProps {
    /** The page the dropzone is on: whether the form is editable, whether the zone's section is locked, and what the zone holds now. */
    readonly binding: IPageBinding;
    /** The form's drag-and-drop controller, used to track the item currently being dragged and to confirm a replacement. */
    readonly controller: IDragAndDropController;
    /** The dropzone this drop target renders; its own type decides which dragged items it accepts. */
    readonly dropzone: Dropzone;

    /** Invoked with the updated dropzone once an item has been dropped and any replacement confirmed; may be async, as a drop needing a lookup is. The caller stores it back onto the owning page. */
    onDrop?: (dropzone: Dropzone) => void | Promise<void>;
}

export default function FDropzone({ binding, controller, dropzone, children, onDrop }: React.PropsWithChildren<IFDropzoneProps>): React.JSX.Element {
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

    // closed on a form that isn't editable, and on a locked section, so no page has to gate its own drops
    const isClosed = !onDrop || binding.mode !== "editable" || binding.isSectionLocked(dropzone.getSection().getDefinition<SectionDefinition>());

    const handleDrop = async (event: React.DragEvent): Promise<void> => {
        event.preventDefault();

        // read before any await, as a drop's data is gone once the event has been handled
        const data = event.dataTransfer.getData(`application/f-importable-${dropzone.type}`);
        if (isClosed || !data) {
            return;
        }

        const item = JSON.parse(data) as IDraggableItem;

        // the helper picks the schema off the item's own type, so this asks once rather than once per importable
        if (!DropzoneHelper.isValidType(item)) {
            return;
        }

        const dropped = dropzone.onDrop(item.data);
        const page = binding.get();

        // a drop replaces the whole record, so one already there is replaced only once the officer says so
        if (dropzone.getIsOccupied(page) && !await controller.confirmReplace({
            current: dropzone.describe(dropzone.getCurrentFields(page)),
            next: dropped.describe(dropped.getFields()),
            type: dropzone.type
        })) {
            return;
        }

        await onDrop!(dropped);
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

import React, { useEffect, useId, useRef, useState } from "react";

import FBadge from "../badge/badge";
import { IDragAndDropController } from "../../controllers/drag-and-drop-controller";
import { IPageBinding } from "../../controllers/form-controller";

import { DraggableItemType, IDraggableItem } from "../../models/import/draggable-item";
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
    /** What the zone is called where it is offered to be filled by a button; its section's title by default. */
    readonly title?: string;

    /** Invoked with the updated dropzone once an item has been dropped and any replacement confirmed; may be async, as a drop needing a lookup is. The caller stores it back onto the owning page. */
    onDrop?: (dropzone: Dropzone) => void | Promise<void>;
}

/** The data type a drag source puts an item of the given type under. */
function toDataType(type: DraggableItemType): string {
    return `application/f-importable-${type}`;
}

export default function FDropzone({ binding, controller, dropzone, title, children, onDrop }: React.PropsWithChildren<IFDropzoneProps>): React.JSX.Element {
    const [draggingItem, setDraggingItem] = useState<IDraggableItem>();
    const [isOver, setIsOver] = useState(false);
    // dragenter and dragleave fire for every input inside the zone, so the pointer is over it while the count is above zero
    const depth = useRef(0);

    useEffect(() => {
        const startListener = controller.onDragStart(setDraggingItem);
        const endListener = controller.onDragEnd(() => setDraggingItem(undefined));

        return () => {
            startListener.remove();
            endListener.remove();
        };
    }, [controller]);

    // a source removed mid-drag never says it ended, so the window's own end of the drag clears it too
    useEffect(() => {
        if (!draggingItem) {
            depth.current = 0;
            setIsOver(false);
            return;
        }

        const end = (): void => controller.dragEnd();
        window.addEventListener("drop", end);
        window.addEventListener("dragend", end, true);
        // no pointer moves during a drag, so the first one means it is over
        window.addEventListener("pointermove", end);

        return () => {
            window.removeEventListener("drop", end);
            window.removeEventListener("dragend", end, true);
            window.removeEventListener("pointermove", end);
        };
    }, [controller, draggingItem]);

    // closed on a form that isn't editable, and on a locked section, so no page has to gate its own drops
    const isClosed = !onDrop || binding.mode !== "editable" || binding.isSectionLocked(dropzone.getSection().getDefinition<SectionDefinition>());
    const isOfType = draggingItem?.type === dropzone.type;
    const accepts = isOfType && !isClosed;

    const carriesType = (event: React.DragEvent): boolean => Array.from(event.dataTransfer?.types ?? []).includes(toDataType(dropzone.type));

    const handleDragEnter = (event: React.DragEvent): void => {
        if (isOfType || carriesType(event)) {
            depth.current += 1;
            setIsOver(true);
        }
    };

    const handleDragLeave = (): void => {
        depth.current = Math.max(0, depth.current - 1);
        setIsOver(depth.current > 0);
    };

    // allowing the drop is cancelling the drag over; a zone that won't take it says so with the refused cursor
    const handleDragOver = (event: React.DragEvent): void => {
        const allowed = !isClosed && (isOfType || carriesType(event));

        if (allowed) {
            event.preventDefault();
        }

        if (event.dataTransfer) {
            event.dataTransfer.dropEffect = allowed ? "copy" : "none";
        }
    };

    const id = useId();
    const sectionDefinition = dropzone.getSection().getDefinition<SectionDefinition>();

    // the one way into the form, for a drop and for a button alike
    const fill = async (item: IDraggableItem): Promise<void> => {
        // the helper picks the schema off the item's own type, so this asks once rather than once per importable
        if (isClosed || item.type !== dropzone.type || !DropzoneHelper.isValidType(item)) {
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

    // registered through a ref, so a new render doesn't unregister and register the zone again
    const fillRef = useRef(fill);
    fillRef.current = fill;

    useEffect(() => controller.registerTarget({
        id,
        isClosed,
        pageId: binding.pageId,
        title: title ?? sectionDefinition.title,
        type: dropzone.type,
        fill: item => fillRef.current(item)
    }), [controller, id, isClosed, binding.pageId, title, sectionDefinition, dropzone.type]);

    const handleDrop = async (event: React.DragEvent): Promise<void> => {
        event.preventDefault();
        depth.current = 0;
        setIsOver(false);

        // read before any await, as a drop's data is gone once the event has been handled
        const data = event.dataTransfer.getData(toDataType(dropzone.type));
        if (data) {
            await fill(JSON.parse(data) as IDraggableItem);
        }
    };

    return (
        <div
            className={buildClasses("f-dropzone", accepts ? "f-dropzone--accepts" : "", accepts && isOver ? "f-dropzone--over" : "")}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            {isOver && (isOfType || !draggingItem) && (
                <span className="f-dropzone__badge">
                    {isClosed ? <FBadge variant="secondary">Locked</FBadge> : <FBadge variant="success">Drop to fill</FBadge>}
                </span>
            )}
            {children}
        </div>
    );
}

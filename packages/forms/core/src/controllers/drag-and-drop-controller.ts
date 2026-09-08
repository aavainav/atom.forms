import { EventEmitter, IEvent } from "@common/event-emitter";

import { IController } from "./controller";

import { IDraggableItem } from "../models/import/draggable-item";

/** Defines a controller that relays drag-and-drop signals between draggable items and the dropzones they can be dropped onto. */
export interface IDragAndDropController extends IController {
    /** An event that is raised when an item starts being dragged. */
    readonly onDragStart: IEvent<IDraggableItem>;
    /** An event that is raised when a drag ends, whether or not the item was dropped. */
    readonly onDragEnd: IEvent<void>;

    /** Signals that the specified item has started being dragged. */
    dragStart(item: IDraggableItem): void;
    /** Signals that the current drag has ended. */
    dragEnd(): void;
}

export class DragAndDropController implements IDragAndDropController {
    private readonly _changed = new EventEmitter<void>("drag-and-drop:changed");
    private readonly _dragStart = new EventEmitter<IDraggableItem>("drag-and-drop:drag-start");
    private readonly _dragEnd = new EventEmitter<void>("drag-and-drop:drag-end");

    get onChanged(): IEvent<void> {
        return this._changed.event;
    }

    get onDragStart(): IEvent<IDraggableItem> {
        return this._dragStart.event;
    }

    get onDragEnd(): IEvent<void> {
        return this._dragEnd.event;
    }

    dragStart(item: IDraggableItem): void {
        this._dragStart.emit(item);
        this._changed.emit();
    }

    dragEnd(): void {
        this._dragEnd.emit();
        this._changed.emit();
    }

    dispose(): void {
        // the controller relays drag signals and holds no state of its own; subscribers remove their own listeners
    }
}

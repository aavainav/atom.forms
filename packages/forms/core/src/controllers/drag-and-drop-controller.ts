import { EventEmitter, IEvent } from "@common/event-emitter";

import { Controller, ControllerKey, IController } from "./controller";
import { RegisterController } from "./controller-registry";

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

/** Relays drag signals and holds no state of its own, so there is nothing to release on dispose; subscribers remove their own listeners. */
@RegisterController(ControllerKey.dragAndDrop)
export class DragAndDropController extends Controller implements IDragAndDropController {
    private readonly _dragStart = new EventEmitter<IDraggableItem>(`${this.key}:drag-start`);
    private readonly _dragEnd = new EventEmitter<void>(`${this.key}:drag-end`);

    get onDragStart(): IEvent<IDraggableItem> {
        return this._dragStart.event;
    }

    get onDragEnd(): IEvent<void> {
        return this._dragEnd.event;
    }

    dragStart(item: IDraggableItem): void {
        this._dragStart.emit(item);
        this.emitChanged();
    }

    dragEnd(): void {
        this._dragEnd.emit();
        this.emitChanged();
    }
}

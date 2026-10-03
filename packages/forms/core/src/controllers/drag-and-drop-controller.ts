import { EventEmitter, IEvent } from "@common/event-emitter";

import { Controller, ControllerKey, IController } from "./controller";
import { RegisterController } from "./controller-registry";

import { DraggableItemType, IDraggableItem } from "../models/import/draggable-item";
import { Mutable } from "../utils/mutable";

/** The record a drop would replace, and the one it brings, each named for the officer when the fields say enough. */
export interface IReplaceRecord {
    readonly current?: string;
    readonly next?: string;
    readonly type: DraggableItemType;
}

/** Asked before a drop replaces a record the zone already holds; resolve false to leave it. */
export type ConfirmDropReplace = (replacing: IReplaceRecord) => Promise<boolean>;

/** Defines a controller that relays drag-and-drop signals between draggable items and the dropzones they can be dropped onto. */
export interface IDragAndDropController extends IController {
    /** An event that is raised when an item starts being dragged. */
    readonly onDragStart: IEvent<IDraggableItem>;
    /** An event that is raised when a drag ends, whether or not the item was dropped. */
    readonly onDragEnd: IEvent<void>;

    /** Asks the confirm policy whether a drop may replace the record already there; true when no policy is set. */
    confirmReplace(replacing: IReplaceRecord): Promise<boolean>;
    /** Signals that the specified item has started being dragged. */
    dragStart(item: IDraggableItem): void;
    /** Signals that the current drag has ended. */
    dragEnd(): void;
    /** Sets the policy asked before a drop replaces a record; when unset, drops replace without asking. */
    setConfirmReplace(confirm: ConfirmDropReplace | undefined): void;
}

/** Relays drag signals, and holds the policy asked before a drop replaces a record; subscribers remove their own listeners. */
@RegisterController(ControllerKey.dragAndDrop)
export class DragAndDropController extends Controller implements IDragAndDropController {
    private readonly _dragStart = new EventEmitter<IDraggableItem>(`${this.key}:drag-start`);
    private readonly _dragEnd = new EventEmitter<void>(`${this.key}:drag-end`);
    private readonly confirm?: ConfirmDropReplace;

    get onDragStart(): IEvent<IDraggableItem> {
        return this._dragStart.event;
    }

    get onDragEnd(): IEvent<void> {
        return this._dragEnd.event;
    }

    async confirmReplace(replacing: IReplaceRecord): Promise<boolean> {
        return this.confirm ? this.confirm(replacing) : true;
    }

    dragStart(item: IDraggableItem): void {
        this._dragStart.emit(item);
        this.emitChanged();
    }

    dragEnd(): void {
        this._dragEnd.emit();
        this.emitChanged();
    }

    setConfirmReplace(confirm: ConfirmDropReplace | undefined): void {
        (<Mutable<ConfirmDropReplace | undefined>>this.confirm) = confirm;
    }

    public dispose(): void {
        (<Mutable<ConfirmDropReplace | undefined>>this.confirm) = undefined;
    }
}

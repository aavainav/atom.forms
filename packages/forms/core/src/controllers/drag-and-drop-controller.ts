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

/** A dropzone on the form, as something outside it can fill it: what it takes, where it is, and how to fill it. */
export interface IDropTarget {
    readonly id: string;
    /** Whether it would refuse a drop now: the form isn't editable, or its section is locked. */
    readonly isClosed: boolean;
    /** The page it is on, so only the page showing is offered. */
    readonly pageId: string;
    /** What it is called where it is offered. */
    readonly title: string;
    readonly type: DraggableItemType;

    /** Fills it with the item exactly as a drop would, asking first when it already holds a record. */
    fill(item: IDraggableItem): Promise<void>;
}

/** Asked before a drop replaces a record the zone already holds; resolve false to leave it. */
export type ConfirmDropReplace = (replacing: IReplaceRecord) => Promise<boolean>;

/** Defines a controller that relays drag-and-drop signals between draggable items and the dropzones they can be dropped onto. */
export interface IDragAndDropController extends IController {
    /** An event that is raised when an item starts being dragged. */
    readonly onDragStart: IEvent<IDraggableItem>;
    /** An event that is raised when a drag ends, whether or not the item was dropped. */
    readonly onDragEnd: IEvent<void>;
    /** The dropzones mounted on the form, in the order they were registered. */
    readonly targets: ReadonlyArray<IDropTarget>;

    /** Asks the confirm policy whether a drop may replace the record already there; true when no policy is set. */
    confirmReplace(replacing: IReplaceRecord): Promise<boolean>;
    /** Signals that the specified item has started being dragged. */
    dragStart(item: IDraggableItem): void;
    /** Signals that the current drag has ended. */
    dragEnd(): void;
    /** Registers a dropzone, replacing one registered under the same id; answers with what unregisters it. */
    registerTarget(target: IDropTarget): () => void;
    /** Sets the policy asked before a drop replaces a record; when unset, drops replace without asking. */
    setConfirmReplace(confirm: ConfirmDropReplace | undefined): void;
}

/** Relays drag signals, holds the policy asked before a drop replaces a record, and the dropzones mounted on the form; subscribers remove their own listeners. */
@RegisterController(ControllerKey.dragAndDrop)
export class DragAndDropController extends Controller implements IDragAndDropController {
    private readonly _dragStart = new EventEmitter<IDraggableItem>(`${this.key}:drag-start`);
    private readonly _dragEnd = new EventEmitter<void>(`${this.key}:drag-end`);
    private readonly confirm?: ConfirmDropReplace;
    private _targets: ReadonlyArray<IDropTarget> = [];

    get onDragStart(): IEvent<IDraggableItem> {
        return this._dragStart.event;
    }

    get onDragEnd(): IEvent<void> {
        return this._dragEnd.event;
    }

    get targets(): ReadonlyArray<IDropTarget> {
        return this._targets;
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

    registerTarget(target: IDropTarget): () => void {
        // a new array on every change, so a hook comparing snapshots sees it change, and only then
        this._targets = [...this._targets.filter(entry => entry.id !== target.id), target];
        this.emitChanged();

        return () => {
            this._targets = this._targets.filter(entry => entry !== target);
            this.emitChanged();
        };
    }

    setConfirmReplace(confirm: ConfirmDropReplace | undefined): void {
        (<Mutable<ConfirmDropReplace | undefined>>this.confirm) = confirm;
    }

    public dispose(): void {
        (<Mutable<ConfirmDropReplace | undefined>>this.confirm) = undefined;
        this._targets = [];
    }
}

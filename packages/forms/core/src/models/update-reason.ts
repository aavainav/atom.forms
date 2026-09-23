import type { DraggableItemType } from "./import/draggable-item";

/** Why a drag-and-drop populated fields, rather than the officer typing them. */
export interface IDropUpdateReason {
    readonly kind: "drop";
    readonly type: DraggableItemType;
}

/** Why a form update was made, for anything observing the change to use. Core only carries this through -- it never interprets it. Extend with a new member as a new concern needs one. */
export type UpdateReason = IDropUpdateReason;

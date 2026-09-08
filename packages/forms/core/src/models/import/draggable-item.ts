import { IImportablePerson } from "./importable-person";
import { IImportableVehicle } from "./importable-vehicle";

export type DraggableItemType = "person" | "vehicle";

/** Describes an item being dragged for import into a dropzone. */
export interface IDraggableItem<TData = IImportablePerson | IImportableVehicle> {
    /** The unique identifier of the draggable item. */
    readonly id: string;
    /** The type of item being dragged. */
    readonly type: DraggableItemType;
    /** The importable data carried by the item. */
    readonly data: TData;
}
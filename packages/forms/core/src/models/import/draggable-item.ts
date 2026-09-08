import { IImportablePerson } from "./importable-person";
import { IImportableVehicle } from "./importable-vehicle";
import { IImportableViolation } from "./importable-violation";

export type DraggableItemType = "person" | "vehicle" | "violation";

/** Describes an item being dragged for import into a dropzone. */
export interface IDraggableItem<TData = IImportablePerson | IImportableVehicle | IImportableViolation> {
    /** The unique identifier of the draggable item. */
    readonly id: string;
    /** The type of item being dragged. */
    readonly type: DraggableItemType;
    /** The importable data carried by the item. */
    readonly data: TData;
}
import { DraggableItemType } from "./draggable-item";
import { IDropzone, Dropzone } from "./dropzone";
import { DropzoneHelper } from "./dropzone-helper";
import { IImportableVehicle } from "./importable-vehicle";
import { FieldModel, TValueType } from "../field";
import { PageModel } from "../page";
import { SectionModel } from "../section";
import { NumberFieldModel } from "../number-field";

export enum VehicleDropzoneFields {
    make = "make",
    model = "model",
    year = "year",
}

/** Defines a dropzone for handling importable vehicle data. */
export interface IVehicleDropzone extends IDropzone<IImportableVehicle> {
}

/** Represents a dropzone for handling importable vehicle data. */
export class VehicleDropzone extends Dropzone<IImportableVehicle> implements IVehicleDropzone {
    readonly type: DraggableItemType = "vehicle";

    /**
     * Make and model take fields of any type, not string fields, since a form may hold them as a value-list code
     * rather than free text. A form that does must override {@link onDrop} -- the dropped data carries a name
     * with no code, and resolving that name is the form's own business.
     */
    constructor(
        page: PageModel,
        section: SectionModel,
        make: FieldModel<TValueType>,
        model?: FieldModel<TValueType>,
        year?: NumberFieldModel) {
        super(
            page,
            section,
            {
                [VehicleDropzoneFields.make]: make,
                [VehicleDropzoneFields.model]: model,
                [VehicleDropzoneFields.year]: year
            }
        );
    }

    public onDrop(data: IImportableVehicle): this {
        if (!data) {
            return this;
        }

        let dropzone = this.clearFields();

        dropzone = DropzoneHelper.setValue(dropzone, VehicleDropzoneFields.make, data.make);
        dropzone = DropzoneHelper.setValue(dropzone, VehicleDropzoneFields.model, data.model);
        dropzone = DropzoneHelper.setValue(dropzone, VehicleDropzoneFields.year, data.year);

        return dropzone;
    }
}

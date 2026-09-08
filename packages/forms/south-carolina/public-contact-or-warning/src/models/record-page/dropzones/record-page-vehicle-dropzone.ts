import { IImportableVehicle, IVehicleDropzone, VehicleDropzone, VehicleDropzoneFields } from "@forms/core";
import { PublicContactOrWarningFormSchema } from "../../public-contact-or-warning-form-schema";
import { RecordPageModel } from "../record-page";
import { VehicleSectionModel } from "../vehicle-section";

export interface IRecordPageVehicleDropzone extends IVehicleDropzone {
}

/** Represents the dropzone for importing vehicle data onto the public contact/warning record's vehicle section. */
export class RecordPageVehicleDropzone extends VehicleDropzone implements IRecordPageVehicleDropzone {
    constructor(page: RecordPageModel, schema: PublicContactOrWarningFormSchema) {
        super(
            page,
            page.get<VehicleSectionModel>(schema.vehicleSection),
            page.get<VehicleSectionModel>(schema.vehicleSection).getMake(),
            page.get<VehicleSectionModel>(schema.vehicleSection).getModel(),
            page.get<VehicleSectionModel>(schema.vehicleSection).getYear()
        );
    }

    /**
     * Records the dropped vehicle, holding the make and model as the names they arrived as and no code.
     *
     * The record's make and model are codes chosen from a value list, and dropped data carries only a name, so
     * a name is all this can put on the dropzone. Turning it into a code means looking it up in a list that has
     * to be loaded, which cannot happen here; `IPublicContactOrWarningService.resolveVehicleDropzone` does it
     * before the dropzone is applied to the page, and drops whatever it cannot resolve. Nothing carrying a name
     * with no code reaches the form.
     */
    public onDrop(data: IImportableVehicle): this {
        if (!data) {
            return this;
        }

        const fields = this.clearFields().fields;

        return this.setFields({
            ...fields,
            [VehicleDropzoneFields.make]: fields[VehicleDropzoneFields.make]?.setValue({ value: "", description: data.make }),
            [VehicleDropzoneFields.model]: fields[VehicleDropzoneFields.model]?.setValue({ value: "", description: data.model }),
            [VehicleDropzoneFields.year]: fields[VehicleDropzoneFields.year]?.setValue(data.year)
        });
    }
}

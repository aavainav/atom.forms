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
     * Records the dropped vehicle, holding make and model as the names they arrived as, with no code. The
     * record's make/model are value-list codes, and dropped data carries only a name, so a name is all this can
     * hold. `IPublicContactOrWarningService.resolveVehicleDropzone` turns it into a code before applying the
     * dropzone, dropping whatever it can't resolve -- nothing with a name and no code reaches the form.
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

import { IImportableVehicle, IVehicleDropzone, VehicleDropzone, VehicleDropzoneFields } from "@forms/core";
import { TR310FormSchema } from "../../tr310-form-schema";
import { UnitPageModel } from "../unit-page";
import { VehicleSectionModel } from "../vehicle-section";

export interface IUnitPageVehicleDropzone extends IVehicleDropzone {
}

/** Represents the dropzone for importing vehicle data onto a TR-310 unit page's vehicle section. */
export class UnitPageVehicleDropzone extends VehicleDropzone implements IUnitPageVehicleDropzone {
    constructor(page: UnitPageModel, schema: TR310FormSchema) {
        const section = page.get<VehicleSectionModel>(schema.vehicleSection);

        super(
            page,
            section,
            section.getMake(),
            section.getModel(),
            section.getYear()
        );
    }

    /**
     * Records the dropped vehicle, holding make and model as the names they arrived as, with no code. The
     * report's make/model are value-list codes, and dropped data carries only a name, so a name is all this can
     * hold. `ITR310Service.resolveVehicleDropzone` turns it into a code before applying the dropzone, dropping
     * whatever it can't resolve -- nothing with a name and no code reaches the form.
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

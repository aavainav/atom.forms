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
     * Records the dropped vehicle, holding the make and model as the names they arrived as and no code.
     *
     * The report's make and model are codes chosen from a value list, and dropped data carries only a name, so a
     * name is all this can put on the dropzone. Turning it into a code means looking it up in a list that has to
     * be loaded, which cannot happen here; `ITR310Service.resolveVehicleDropzone` does it before the dropzone is
     * applied to the page, and drops whatever it cannot resolve. Nothing carrying a name with no code reaches the
     * form.
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

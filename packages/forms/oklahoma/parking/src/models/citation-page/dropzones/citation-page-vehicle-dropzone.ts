import { IImportableVehicle, IVehicleDropzone, VehicleDropzone, VehicleDropzoneFields } from "@forms/core";
import { OKParkingFormSchema } from "../../parking-form-schema";
import { CitationPageModel } from "../citation-page";
import { VehicleSectionModel } from "../vehicle-section";

export interface ICitationPageVehicleDropzone extends IVehicleDropzone {
}

/**
 * Dropzone for vehicle data onto the parking citation page. Only make is mapped -- model and year live on the
 * detail page, and a dropzone writes only the section it's built from. Make is an option field, so a drop must
 * resolve from its arrival name to the stored code before applying -- see `IOKParkingService.resolveVehicleDropzone`.
 */
export class CitationPageVehicleDropzone extends VehicleDropzone implements ICitationPageVehicleDropzone {
    constructor(page: CitationPageModel, schema: OKParkingFormSchema) {
        super(
            page,
            page.get<VehicleSectionModel>(schema.vehicleSection),
            page.get<VehicleSectionModel>(schema.vehicleSection).getMake()
        );
    }

    /**
     * Records the dropped vehicle's make as the name it arrived as, with no code. The citation's make is a
     * value-list code, and dropped data carries only a name, so a name is all this can hold.
     * `IOKParkingService.resolveVehicleDropzone` turns it into a code before applying the dropzone, dropping
     * whatever it can't resolve -- nothing with a name and no code reaches the form.
     */
    public onDrop(data: IImportableVehicle): this {
        if (!data) {
            return this;
        }

        const fields = this.clearFields().fields;

        return this.setFields({
            ...fields,
            [VehicleDropzoneFields.make]: fields[VehicleDropzoneFields.make]?.setValue({ value: "", description: data.make })
        });
    }
}

import { IImportableVehicle, IVehicleDropzone, VehicleDropzone, VehicleDropzoneFields } from "@forms/core";
import { GAUTCFormSchema } from "../../utc-form-schema";
import { CitationPageModel } from "../citation-page";
import { VehicleSectionModel } from "../vehicle-section";

export interface ICitationPageVehicleDropzone extends IVehicleDropzone {
}

/** Dropzone for vehicle data onto the citation page. Make/model are option fields, not free text, so a drop must resolve from arrival names to stored codes before applying -- see `IGAUTCService.resolveVehicleDropzone`. */
export class CitationPageVehicleDropzone extends VehicleDropzone implements ICitationPageVehicleDropzone {
    constructor(page: CitationPageModel, schema: GAUTCFormSchema) {
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
     * citation's make/model are value-list codes, and dropped data carries only a name, so a name is all this can
     * hold. `IGAUTCService.resolveVehicleDropzone` turns it into a code before applying the dropzone, dropping
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

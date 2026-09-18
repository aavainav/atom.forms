import { IVehicleDropzone, VehicleDropzone } from "@forms/core";
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
}

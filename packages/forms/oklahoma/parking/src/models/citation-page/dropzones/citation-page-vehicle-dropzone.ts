import { IVehicleDropzone, VehicleDropzone } from "@forms/core";
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
}

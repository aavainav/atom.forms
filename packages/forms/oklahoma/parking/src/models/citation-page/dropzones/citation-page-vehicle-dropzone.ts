import { IVehicleDropzone, VehicleDropzone } from "@forms/core";
import { OKParkingFormSchema } from "../../parking-form-schema";
import { CitationPageModel } from "../citation-page";
import { VehicleSectionModel } from "../vehicle-section";

export interface ICitationPageVehicleDropzone extends IVehicleDropzone {
}

/**
 * Represents the dropzone for importing vehicle data onto the parking citation page.
 *
 * Only the make is mapped. The printed form carries the model and year on the detail page instead, and a dropzone
 * writes onto the one section it was built from, so the rest of a dropped vehicle has nowhere to land here. The
 * make is an option field rather than free text, so a drop has to be resolved from the name it arrived with to
 * the code the form stores before it is applied - see `IOKParkingService.resolveVehicleDropzone`.
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

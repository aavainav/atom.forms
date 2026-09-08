import { IVehicleDropzone, VehicleDropzone } from "@forms/core";
import { OKTrafficFormSchema } from "../../traffic-form-schema";
import { ComplaintPageModel } from "../complaint-page";
import { VehicleSectionModel } from "../vehicle-section";

export interface IComplaintPageVehicleDropzone extends IVehicleDropzone {
}

/**
 * Represents the dropzone for importing vehicle data onto the traffic citation form's complaint page.
 *
 * The make and model are option fields rather than free text, so a drop has to be resolved from the names it
 * arrived with to the codes the form stores before it is applied - see `IOKTrafficService.resolveVehicleDropzone`.
 */
export class ComplaintPageVehicleDropzone extends VehicleDropzone implements IComplaintPageVehicleDropzone {
    constructor(page: ComplaintPageModel, schema: OKTrafficFormSchema) {
        super(
            page,
            page.get<VehicleSectionModel>(schema.vehicleSection),
            page.get<VehicleSectionModel>(schema.vehicleSection).getMake(),
            page.get<VehicleSectionModel>(schema.vehicleSection).getModel(),
            page.get<VehicleSectionModel>(schema.vehicleSection).getYear()
        );
    }
}

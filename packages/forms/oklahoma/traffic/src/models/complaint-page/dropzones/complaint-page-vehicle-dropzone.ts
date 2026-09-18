import { IVehicleDropzone, VehicleDropzone } from "@forms/core";
import { OKTrafficFormSchema } from "../../traffic-form-schema";
import { ComplaintPageModel } from "../complaint-page";
import { VehicleSectionModel } from "../vehicle-section";

export interface IComplaintPageVehicleDropzone extends IVehicleDropzone {
}

/** Dropzone for vehicle data onto the complaint page. Make/model are option fields, not free text, so a drop must resolve from arrival names to stored codes before applying -- see `IOKTrafficService.resolveVehicleDropzone`. */
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

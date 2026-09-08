import { IVehicleDropzone, VehicleDropzone } from "@forms/core";
import { S438FormSchema } from "../../s438-form-schema";
import { FrontPageModel } from "../front-page";
import { VehicleSectionModel } from "../vehicle-section";

export interface IFrontPageVehicleDropzone extends IVehicleDropzone {
}

/** Represents the dropzone for importing vehicle data onto the s438 form's front page. */
export class FrontPageVehicleDropzone extends VehicleDropzone implements IFrontPageVehicleDropzone {
    constructor(page: FrontPageModel, schema: S438FormSchema) {
        super(
            page, 
            page.get<VehicleSectionModel>(schema.vehicleSection),
            page.get<VehicleSectionModel>(schema.vehicleSection).getMake(),
            undefined,
            page.get<VehicleSectionModel>(schema.vehicleSection).getYear()
        );
    }
}
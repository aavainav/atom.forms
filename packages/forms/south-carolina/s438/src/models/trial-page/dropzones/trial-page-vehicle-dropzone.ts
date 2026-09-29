import { IVehicleDropzone, VehicleDropzone } from "@forms/core";
import { S438FormSchema } from "../../s438-form-schema";
import { TrialPageModel } from "../trial-page";
import { TrialVehicleSectionModel } from "../vehicle-section";

export interface ITrialPageVehicleDropzone extends IVehicleDropzone {
}

/** Represents the dropzone for importing vehicle data onto the s438 form's trial page. The make is free text here, as on the front page, so there is no model to map. */
export class TrialPageVehicleDropzone extends VehicleDropzone implements ITrialPageVehicleDropzone {
    constructor(page: TrialPageModel, schema: S438FormSchema) {
        const section = page.get<TrialVehicleSectionModel>(schema.trialVehicleSection);

        super(
            page,
            section,
            section.getMake(),
            undefined,
            section.getYear()
        );
    }
}

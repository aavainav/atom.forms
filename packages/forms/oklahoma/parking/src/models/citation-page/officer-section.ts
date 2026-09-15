import { FieldDefinition, FormModel, ISection, SectionModel, StringFieldModel } from "@forms/core";
import { OKParkingFormSchema } from "../parking-form-schema";

export interface IOfficerSection extends ISection {
}

export interface IOfficerSectionModel extends IOfficerSection {
}

/**
 * Represents the model for the officer section of the parking citation page.
 *
 * The officer's name field is `officerName` rather than `name`, because `SectionModel` already declares a `name`
 * holding the section's own name and a field definition cannot shadow it.
 */
export class OfficerSectionModel extends SectionModel implements IOfficerSectionModel {
    private schema: OKParkingFormSchema = FormModel.getSchema<OKParkingFormSchema>(OfficerSectionModel);

    public readonly officerName: FieldDefinition<StringFieldModel> = this.schema.officerFields.officerName;
    public readonly commissionNumber: FieldDefinition<StringFieldModel> = this.schema.officerFields.officerCommissionNumber;

    public getCommissionNumber(): StringFieldModel { return this.get<StringFieldModel>(this.commissionNumber); }
    public getOfficerName(): StringFieldModel { return this.get<StringFieldModel>(this.officerName); }
}

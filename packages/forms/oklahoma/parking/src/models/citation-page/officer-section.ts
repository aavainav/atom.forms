import { FieldDefinition, FormModel, ISection, SectionModel, StringFieldModel } from "@forms/core";
import { OKParkingFormSchema } from "../parking-form-schema";

export interface IOfficerSection extends ISection {
}

export interface IOfficerSectionModel extends IOfficerSection {
}

/** Model for the officer section of the citation page. The officer's name field is `officerName`, not `name`, since `SectionModel` already declares `name` for the section's own name. */
export class OfficerSectionModel extends SectionModel implements IOfficerSectionModel {
    private schema: OKParkingFormSchema = FormModel.getSchema<OKParkingFormSchema>(OfficerSectionModel);

    public readonly officerName: FieldDefinition<StringFieldModel> = this.schema.officerFields.officerName;
    public readonly commissionNumber: FieldDefinition<StringFieldModel> = this.schema.officerFields.officerCommissionNumber;

    public getCommissionNumber(): StringFieldModel { return this.get<StringFieldModel>(this.commissionNumber); }
    public getOfficerName(): StringFieldModel { return this.get<StringFieldModel>(this.officerName); }
}

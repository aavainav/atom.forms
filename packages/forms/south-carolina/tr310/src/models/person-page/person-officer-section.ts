import { ISection, FieldDefinition, FormModel, SectionModel, StringFieldModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface IPersonOfficerSection extends ISection {
}

export interface IPersonOfficerSectionModel extends IPersonOfficerSection {
}

/** Represents the model for the person page's officer footer. */
export class PersonOfficerSectionModel extends SectionModel implements IPersonOfficerSectionModel {
    private schema: TR310FormSchema = FormModel.getSchema<TR310FormSchema>(TR310FormSchema);

    public readonly officerName: FieldDefinition<StringFieldModel> = this.schema.personOfficerFields.personOfficerName;
    public readonly rank: FieldDefinition<StringFieldModel> = this.schema.personOfficerFields.personOfficerRank;
    public readonly cjaNumber: FieldDefinition<StringFieldModel> = this.schema.personOfficerFields.personOfficerCjaNumber;
    public readonly internalAgency: FieldDefinition<StringFieldModel> = this.schema.personOfficerFields.personOfficerInternalAgency;

    public getOfficerName(): StringFieldModel { return this.get<StringFieldModel>(this.officerName); }
    public getRank(): StringFieldModel { return this.get<StringFieldModel>(this.rank); }
    public getCjaNumber(): StringFieldModel { return this.get<StringFieldModel>(this.cjaNumber); }
    public getInternalAgency(): StringFieldModel { return this.get<StringFieldModel>(this.internalAgency); }
}

import { ISection, FieldDefinition, SectionModel, StringFieldModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface IPersonOfficerSection extends ISection {
}

export interface IPersonOfficerSectionModel extends IPersonOfficerSection {
}

/** Represents the model for the person page's officer footer. */
export class PersonOfficerSectionModel extends SectionModel implements IPersonOfficerSectionModel {
    private formSchema: TR310FormSchema = this.getSchema<TR310FormSchema>();

    public readonly officerName: FieldDefinition<StringFieldModel> = this.formSchema.personOfficerFields.personOfficerName;
    public readonly rank: FieldDefinition<StringFieldModel> = this.formSchema.personOfficerFields.personOfficerRank;
    public readonly cjaNumber: FieldDefinition<StringFieldModel> = this.formSchema.personOfficerFields.personOfficerCjaNumber;
    public readonly internalAgency: FieldDefinition<StringFieldModel> = this.formSchema.personOfficerFields.personOfficerInternalAgency;

    public getOfficerName(): StringFieldModel { return this.get<StringFieldModel>(this.officerName); }
    public getRank(): StringFieldModel { return this.get<StringFieldModel>(this.rank); }
    public getCjaNumber(): StringFieldModel { return this.get<StringFieldModel>(this.cjaNumber); }
    public getInternalAgency(): StringFieldModel { return this.get<StringFieldModel>(this.internalAgency); }
}

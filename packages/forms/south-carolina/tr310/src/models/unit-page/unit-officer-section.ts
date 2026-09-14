import { ISection, FieldDefinition, SectionModel, StringFieldModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface IUnitOfficerSection extends ISection {
}

export interface IUnitOfficerSectionModel extends IUnitOfficerSection {
}

/** Represents the model for the unit page's officer footer. */
export class UnitOfficerSectionModel extends SectionModel implements IUnitOfficerSectionModel {
    private formSchema: TR310FormSchema = this.getSchema<TR310FormSchema>();

    public readonly officerName: FieldDefinition<StringFieldModel> = this.formSchema.unitOfficerFields.unitOfficerName;
    public readonly rank: FieldDefinition<StringFieldModel> = this.formSchema.unitOfficerFields.unitOfficerRank;
    public readonly cjaNumber: FieldDefinition<StringFieldModel> = this.formSchema.unitOfficerFields.unitOfficerCjaNumber;
    public readonly internalAgency: FieldDefinition<StringFieldModel> = this.formSchema.unitOfficerFields.unitOfficerInternalAgency;

    public getOfficerName(): StringFieldModel { return this.get<StringFieldModel>(this.officerName); }
    public getRank(): StringFieldModel { return this.get<StringFieldModel>(this.rank); }
    public getCjaNumber(): StringFieldModel { return this.get<StringFieldModel>(this.cjaNumber); }
    public getInternalAgency(): StringFieldModel { return this.get<StringFieldModel>(this.internalAgency); }
}

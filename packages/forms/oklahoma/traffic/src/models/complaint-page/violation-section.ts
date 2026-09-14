import { ISection, FieldDefinition, OptionFieldModel, SectionModel, StringFieldModel } from "@forms/core";
import { OKTrafficFormSchema } from "../traffic-form-schema";

export interface IViolationSection extends ISection {
}

export interface IViolationSectionModel extends IViolationSection {
}

/** Represents the model for the violation section of the traffic citation form's complaint page. */
export class ViolationSectionModel extends SectionModel implements IViolationSectionModel {
    private formSchema: OKTrafficFormSchema = this.getSchema<OKTrafficFormSchema>();

    public readonly date: FieldDefinition<StringFieldModel> = this.formSchema.violationFields.violationDate;
    public readonly time: FieldDefinition<StringFieldModel> = this.formSchema.violationFields.violationTime;
    public readonly county: FieldDefinition<OptionFieldModel> = this.formSchema.violationFields.violationCounty;
    public readonly isBlock: FieldDefinition<OptionFieldModel> = this.formSchema.violationFields.violationIsBlock;
    public readonly location: FieldDefinition<StringFieldModel> = this.formSchema.violationFields.violationLocation;
    public readonly municipalCode: FieldDefinition<StringFieldModel> = this.formSchema.violationFields.violationMunicipalCode;
    public readonly offenseCode: FieldDefinition<StringFieldModel> = this.formSchema.violationFields.violationOffenseCode;
    public readonly byActOf: FieldDefinition<StringFieldModel> = this.formSchema.violationFields.violationByActOf;

    public getByActOf(): StringFieldModel { return this.get<StringFieldModel>(this.byActOf); }
    public getCounty(): OptionFieldModel { return this.get<OptionFieldModel>(this.county); }
    public getDate(): StringFieldModel { return this.get<StringFieldModel>(this.date); }
    public getIsBlock(): OptionFieldModel { return this.get<OptionFieldModel>(this.isBlock); }
    public getLocation(): StringFieldModel { return this.get<StringFieldModel>(this.location); }
    public getMunicipalCode(): StringFieldModel { return this.get<StringFieldModel>(this.municipalCode); }
    public getOffenseCode(): StringFieldModel { return this.get<StringFieldModel>(this.offenseCode); }
    public getTime(): StringFieldModel { return this.get<StringFieldModel>(this.time); }
}

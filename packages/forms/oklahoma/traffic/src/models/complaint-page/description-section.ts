import { ISection, FieldDefinition, FormModel, NumberFieldModel, OptionFieldModel, SectionModel, StringFieldModel } from "@forms/core";
import { OKTrafficFormSchema } from "../traffic-form-schema";

export interface IDescriptionSection extends ISection {
}

export interface IDescriptionSectionModel extends IDescriptionSection {
}

/**
 * Represents the model for the defendant's physical description on the traffic citation form's complaint page.
 *
 * Race and ethnicity are free text rather than option fields: the printed form takes a code in each, but Oklahoma
 * City's code sets for them are not published with the form. Each becomes an option field the day that list
 * arrives, by registering it in `value-lists.ts` and changing the field's constructor in the schema.
 */
export class DescriptionSectionModel extends SectionModel implements IDescriptionSectionModel {
    private schema: OKTrafficFormSchema = FormModel.getSchema<OKTrafficFormSchema>(OKTrafficFormSchema);

    public readonly dateOfBirth: FieldDefinition<StringFieldModel> = this.schema.descriptionFields.descriptionDateOfBirth;
    public readonly race: FieldDefinition<StringFieldModel> = this.schema.descriptionFields.descriptionRace;
    public readonly ethnicity: FieldDefinition<StringFieldModel> = this.schema.descriptionFields.descriptionEthnicity;
    public readonly sex: FieldDefinition<OptionFieldModel> = this.schema.descriptionFields.descriptionSex;
    public readonly height: FieldDefinition<StringFieldModel> = this.schema.descriptionFields.descriptionHeight;
    public readonly weight: FieldDefinition<NumberFieldModel> = this.schema.descriptionFields.descriptionWeight;

    public getDateOfBirth(): StringFieldModel { return this.get<StringFieldModel>(this.dateOfBirth); }
    public getEthnicity(): StringFieldModel { return this.get<StringFieldModel>(this.ethnicity); }
    public getHeight(): StringFieldModel { return this.get<StringFieldModel>(this.height); }
    public getRace(): StringFieldModel { return this.get<StringFieldModel>(this.race); }
    public getSex(): OptionFieldModel { return this.get<OptionFieldModel>(this.sex); }
    public getWeight(): NumberFieldModel { return this.get<NumberFieldModel>(this.weight); }
}

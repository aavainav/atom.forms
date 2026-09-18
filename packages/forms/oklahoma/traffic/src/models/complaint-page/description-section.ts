import { FieldDefinition, FormModel, ISection, NumberFieldModel, OptionFieldModel, SectionModel, StringFieldModel } from "@forms/core";
import { OKTrafficFormSchema } from "../traffic-form-schema";

export interface IDescriptionSection extends ISection {
}

export interface IDescriptionSectionModel extends IDescriptionSection {
}

/** Model for the defendant's physical description on the complaint page. Race and ethnicity are free text, not option fields, since Oklahoma City's code sets for them aren't published -- each becomes coded once a list arrives, via `value-lists.ts` and a schema constructor change. */
export class DescriptionSectionModel extends SectionModel implements IDescriptionSectionModel {
    private schema: OKTrafficFormSchema = FormModel.getSchema<OKTrafficFormSchema>(DescriptionSectionModel);

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

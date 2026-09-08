import { ISection, FieldDefinition, FormModel, OptionFieldModel, SectionModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface INonMotoristSection extends ISection {
}

export interface INonMotoristSectionModel extends INonMotoristSection {
}

/** Represents the model for a non-motorist - what they were travelling as and what distracted them - which stands in for the driver fields when the page records one. */
export class NonMotoristSectionModel extends SectionModel implements INonMotoristSectionModel {
    private schema: TR310FormSchema = FormModel.getSchema<TR310FormSchema>(TR310FormSchema);

    public readonly unitType: FieldDefinition<OptionFieldModel> = this.schema.nonMotoristFields.nonMotoristUnitType;
    public readonly distraction: FieldDefinition<OptionFieldModel> = this.schema.nonMotoristFields.nonMotoristDistraction;

    public getUnitType(): OptionFieldModel { return this.get<OptionFieldModel>(this.unitType); }
    public getDistraction(): OptionFieldModel { return this.get<OptionFieldModel>(this.distraction); }
}

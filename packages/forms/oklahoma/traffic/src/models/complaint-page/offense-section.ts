import { ISection, FieldDefinition, NumberFieldModel, SectionModel, StringFieldModel } from "@forms/core";
import { OKTrafficFormSchema } from "../traffic-form-schema";

export interface IOffenseSection extends ISection {
}

export interface IOffenseSectionModel extends IOffenseSection {
}

/** Represents the model for the offense notes and the amount due on the traffic citation form's complaint page. */
export class OffenseSectionModel extends SectionModel implements IOffenseSectionModel {
    private formSchema: OKTrafficFormSchema = this.getSchema<OKTrafficFormSchema>();

    public readonly notes: FieldDefinition<StringFieldModel> = this.formSchema.offenseFields.offenseNotes;
    public readonly dueDate: FieldDefinition<StringFieldModel> = this.formSchema.offenseFields.offenseDueDate;
    public readonly amountDue: FieldDefinition<NumberFieldModel> = this.formSchema.offenseFields.offenseAmountDue;

    public getAmountDue(): NumberFieldModel { return this.get<NumberFieldModel>(this.amountDue); }
    public getDueDate(): StringFieldModel { return this.get<StringFieldModel>(this.dueDate); }
    public getNotes(): StringFieldModel { return this.get<StringFieldModel>(this.notes); }
}

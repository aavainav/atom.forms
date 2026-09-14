import { ISection, FieldDefinition, SectionModel, StringFieldModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface IViolationsSection extends ISection {
}

export interface IViolationsSectionModel extends IViolationsSection {
}

/** Represents the model for the two violation rows the unit page carries. The form prints a fixed two rows, so they are two numbered groups of fields rather than a collection. */
export class ViolationsSectionModel extends SectionModel implements IViolationsSectionModel {
    private formSchema: TR310FormSchema = this.getSchema<TR310FormSchema>();

    public readonly oneStatuteNumber: FieldDefinition<StringFieldModel> = this.formSchema.violationsFields.violationOneStatuteNumber;
    public readonly oneCharge: FieldDefinition<StringFieldModel> = this.formSchema.violationsFields.violationOneCharge;
    public readonly oneTicketNumber: FieldDefinition<StringFieldModel> = this.formSchema.violationsFields.violationOneTicketNumber;
    public readonly twoStatuteNumber: FieldDefinition<StringFieldModel> = this.formSchema.violationsFields.violationTwoStatuteNumber;
    public readonly twoCharge: FieldDefinition<StringFieldModel> = this.formSchema.violationsFields.violationTwoCharge;
    public readonly twoTicketNumber: FieldDefinition<StringFieldModel> = this.formSchema.violationsFields.violationTwoTicketNumber;

    public getOneStatuteNumber(): StringFieldModel { return this.get<StringFieldModel>(this.oneStatuteNumber); }
    public getOneCharge(): StringFieldModel { return this.get<StringFieldModel>(this.oneCharge); }
    public getOneTicketNumber(): StringFieldModel { return this.get<StringFieldModel>(this.oneTicketNumber); }
    public getTwoStatuteNumber(): StringFieldModel { return this.get<StringFieldModel>(this.twoStatuteNumber); }
    public getTwoCharge(): StringFieldModel { return this.get<StringFieldModel>(this.twoCharge); }
    public getTwoTicketNumber(): StringFieldModel { return this.get<StringFieldModel>(this.twoTicketNumber); }
}

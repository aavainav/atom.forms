import { 
    ISection,
    FieldDefinition,
    SectionModel, 
    StringFieldModel } from "@forms/core";
import { S438FormSchema } from "../s438-form-schema";

export interface IFooterSection extends ISection {
}

export interface IFooterSectionModel extends IFooterSection {
}

/** Represents the model for the footer section of the s438 form's front page. */
export class FooterSectionModel extends SectionModel implements IFooterSectionModel {
    private formSchema: S438FormSchema = this.getSchema<S438FormSchema>();

    public readonly ticketNumber: FieldDefinition<StringFieldModel> = this.formSchema.footerFields.footerTicketNumber;

    public getTicketNumber(): StringFieldModel { return this.get<StringFieldModel>(this.ticketNumber); }
} 
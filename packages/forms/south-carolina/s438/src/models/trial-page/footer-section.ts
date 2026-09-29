import { FieldDefinition, FormModel, ISection, SectionModel, StringFieldModel } from "@forms/core";
import { S438FormSchema } from "../s438-form-schema";

export interface ITrialFooterSection extends ISection {
}

export interface ITrialFooterSectionModel extends ITrialFooterSection {
}

/** Represents the model for the footer section of the s438 form's trial page. */
export class TrialFooterSectionModel extends SectionModel implements ITrialFooterSectionModel {
    private schema: S438FormSchema = FormModel.getSchema<S438FormSchema>(TrialFooterSectionModel);

    public readonly ticketNumber: FieldDefinition<StringFieldModel> = this.schema.trialFooterFields.trialFooterTicketNumber;

    public getTicketNumber(): StringFieldModel { return this.get<StringFieldModel>(this.ticketNumber); }
}

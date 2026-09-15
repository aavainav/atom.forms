import { FieldDefinition, FormModel, ISection, SectionModel, StringFieldModel } from "@forms/core";
import { OKParkingFormSchema } from "../parking-form-schema";

export interface ICourtSection extends ISection {
}

export interface ICourtSectionModel extends ICourtSection {
}

/**
 * Represents the model for the court section of the parking citation page.
 *
 * The court's name and address are preprinted on the form rather than filled in, so they are rendered as text by
 * the section's component and are not fields.
 */
export class CourtSectionModel extends SectionModel implements ICourtSectionModel {
    private schema: OKParkingFormSchema = FormModel.getSchema<OKParkingFormSchema>(CourtSectionModel);

    public readonly date: FieldDefinition<StringFieldModel> = this.schema.courtFields.courtDate;
    public readonly time: FieldDefinition<StringFieldModel> = this.schema.courtFields.courtTime;

    public getDate(): StringFieldModel { return this.get<StringFieldModel>(this.date); }
    public getTime(): StringFieldModel { return this.get<StringFieldModel>(this.time); }
}

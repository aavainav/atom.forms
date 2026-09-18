import { FieldDefinition, FormModel, ISection, SectionModel, StringFieldModel } from "@forms/core";
import { OKParkingFormSchema } from "../parking-form-schema";

export interface ICourtSection extends ISection {
}

export interface ICourtSectionModel extends ICourtSection {
}

/** Model for the court section of the citation page. Court name and address are preprinted, not filled in, so the section's component renders them as text rather than as fields. */
export class CourtSectionModel extends SectionModel implements ICourtSectionModel {
    private schema: OKParkingFormSchema = FormModel.getSchema<OKParkingFormSchema>(CourtSectionModel);

    public readonly date: FieldDefinition<StringFieldModel> = this.schema.courtFields.courtDate;
    public readonly time: FieldDefinition<StringFieldModel> = this.schema.courtFields.courtTime;

    public getDate(): StringFieldModel { return this.get<StringFieldModel>(this.date); }
    public getTime(): StringFieldModel { return this.get<StringFieldModel>(this.time); }
}

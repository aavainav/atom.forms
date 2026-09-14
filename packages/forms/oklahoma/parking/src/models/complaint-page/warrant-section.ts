import { ISection, BooleanFieldModel, FieldDefinition, SectionModel, StringFieldModel } from "@forms/core";
import { OKParkingFormSchema } from "../parking-form-schema";

export interface IWarrantSection extends ISection {
}

export interface IWarrantSectionModel extends IWarrantSection {
}

/** Represents the model for the counselor's recommendation that a warrant be issued. */
export class WarrantSectionModel extends SectionModel implements IWarrantSectionModel {
    private formSchema: OKParkingFormSchema = this.getSchema<OKParkingFormSchema>();

    public readonly approved: FieldDefinition<BooleanFieldModel> = this.formSchema.warrantFields.warrantApproved;
    public readonly counselor: FieldDefinition<StringFieldModel> = this.formSchema.warrantFields.warrantCounselor;

    public getApproved(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.approved); }
    public getCounselor(): StringFieldModel { return this.get<StringFieldModel>(this.counselor); }
}

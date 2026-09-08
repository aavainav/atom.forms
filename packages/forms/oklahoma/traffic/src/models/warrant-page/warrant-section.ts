import { ISection, BooleanFieldModel, FieldDefinition, FormModel, SectionModel, StringFieldModel } from "@forms/core";
import { OKTrafficFormSchema } from "../traffic-form-schema";

export interface IWarrantSection extends ISection {
}

export interface IWarrantSectionModel extends IWarrantSection {
}

/** Represents the model for the counselor's recommendation that a warrant be issued. */
export class WarrantSectionModel extends SectionModel implements IWarrantSectionModel {
    private schema: OKTrafficFormSchema = FormModel.getSchema<OKTrafficFormSchema>(OKTrafficFormSchema);

    public readonly approved: FieldDefinition<BooleanFieldModel> = this.schema.warrantFields.warrantApproved;
    public readonly counselor: FieldDefinition<StringFieldModel> = this.schema.warrantFields.warrantCounselor;

    public getApproved(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.approved); }
    public getCounselor(): StringFieldModel { return this.get<StringFieldModel>(this.counselor); }
}

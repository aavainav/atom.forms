import { FieldDefinition, FormModel, ISection, SectionModel, StringFieldModel } from "@forms/core";
import { OKTrafficFormSchema } from "../traffic-form-schema";

export interface IArraignmentSection extends ISection {
}

export interface IArraignmentSectionModel extends IArraignmentSection {
}

/** Represents the model for the defendant's promise to appear on the traffic citation form's complaint page. */
export class ArraignmentSectionModel extends SectionModel implements IArraignmentSectionModel {
    private schema: OKTrafficFormSchema = FormModel.getSchema<OKTrafficFormSchema>(ArraignmentSectionModel);

    public readonly courtDate: FieldDefinition<StringFieldModel> = this.schema.arraignmentFields.arraignmentCourtDate;
    public readonly courtTime: FieldDefinition<StringFieldModel> = this.schema.arraignmentFields.arraignmentCourtTime;
    public readonly defendantSignature: FieldDefinition<StringFieldModel> = this.schema.arraignmentFields.arraignmentDefendantSignature;

    public getCourtDate(): StringFieldModel { return this.get<StringFieldModel>(this.courtDate); }
    public getCourtTime(): StringFieldModel { return this.get<StringFieldModel>(this.courtTime); }
    public getDefendantSignature(): StringFieldModel { return this.get<StringFieldModel>(this.defendantSignature); }
}

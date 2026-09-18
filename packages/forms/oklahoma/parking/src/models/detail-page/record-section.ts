import { FieldDefinition, FormModel, ISection, OptionFieldModel, SectionModel, StringFieldModel } from "@forms/core";
import { OKParkingFormSchema } from "../parking-form-schema";

export interface IRecordSection extends ISection {
}

export interface IRecordSectionModel extends IRecordSection {
}

/** Model for the record section of the detail page. Beat, tribe and void reason are free text, not option fields, since Oklahoma City's code sets for them aren't published -- each becomes coded once a list arrives, via `value-lists.ts` and a schema constructor change. */
export class RecordSectionModel extends SectionModel implements IRecordSectionModel {
    private schema: OKParkingFormSchema = FormModel.getSchema<OKParkingFormSchema>(RecordSectionModel);

    public readonly citationNumber: FieldDefinition<StringFieldModel> = this.schema.recordFields.recordCitationNumber;
    public readonly county: FieldDefinition<OptionFieldModel> = this.schema.recordFields.recordCounty;
    public readonly beat: FieldDefinition<StringFieldModel> = this.schema.recordFields.recordBeat;
    public readonly tribe: FieldDefinition<StringFieldModel> = this.schema.recordFields.recordTribe;
    public readonly voidReason: FieldDefinition<StringFieldModel> = this.schema.recordFields.recordVoidReason;

    public getBeat(): StringFieldModel { return this.get<StringFieldModel>(this.beat); }
    public getCitationNumber(): StringFieldModel { return this.get<StringFieldModel>(this.citationNumber); }
    public getCounty(): OptionFieldModel { return this.get<OptionFieldModel>(this.county); }
    public getTribe(): StringFieldModel { return this.get<StringFieldModel>(this.tribe); }
    public getVoidReason(): StringFieldModel { return this.get<StringFieldModel>(this.voidReason); }
}

import { FieldDefinition, FormModel, ISection, OptionFieldModel, SectionModel, StringFieldModel } from "@forms/core";
import { OKParkingFormSchema } from "../parking-form-schema";

export interface IRecordSection extends ISection {
}

export interface IRecordSectionModel extends IRecordSection {
}

/**
 * Represents the model for the record section of the parking violation form's detail page.
 *
 * The beat, tribe and void reason are free text rather than option fields: the printed form takes a code in each,
 * but Oklahoma City's code sets for them are not published with the form. Each becomes an option field the day
 * that list arrives, by registering it in `value-lists.ts` and changing the field's constructor in the schema.
 */
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

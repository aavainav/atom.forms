import { ISection, BooleanFieldModel, FieldDefinition, SectionModel, StringFieldModel } from "@forms/core";
import { GAUTCFormSchema } from "../utc-form-schema";
import { selectExclusive } from "../exclusive-group";

export interface IHeaderSection extends ISection {
}

export interface IHeaderSectionModel extends IHeaderSection {
}

/**
 * Represents the model for the header of the Georgia uniform traffic citation.
 *
 * The date and time the citation is issued are held as the separate month, day, year, hour and minute boxes the
 * paper prints rather than as one date and one time, because that is what an officer fills in and what the printed
 * citation has room for.
 */
export class HeaderSectionModel extends SectionModel implements IHeaderSectionModel {
    private formSchema: GAUTCFormSchema = this.getSchema<GAUTCFormSchema>();

    public readonly cicaNumber: FieldDefinition<StringFieldModel> = this.formSchema.headerFields.headerCicaNumber;
    public readonly ncicNumber: FieldDefinition<StringFieldModel> = this.formSchema.headerFields.headerNcicNumber;
    public readonly citationNumber: FieldDefinition<StringFieldModel> = this.formSchema.headerFields.headerCitationNumber;
    public readonly month: FieldDefinition<StringFieldModel> = this.formSchema.headerFields.headerMonth;
    public readonly day: FieldDefinition<StringFieldModel> = this.formSchema.headerFields.headerDay;
    public readonly year: FieldDefinition<StringFieldModel> = this.formSchema.headerFields.headerYear;
    public readonly hour: FieldDefinition<StringFieldModel> = this.formSchema.headerFields.headerHour;
    public readonly minute: FieldDefinition<StringFieldModel> = this.formSchema.headerFields.headerMinute;
    public readonly am: FieldDefinition<BooleanFieldModel> = this.formSchema.headerFields.headerAm;
    public readonly pm: FieldDefinition<BooleanFieldModel> = this.formSchema.headerFields.headerPm;

    /** The AM/PM pair, which answers one question and so holds at most one box. */
    public readonly meridiem: ReadonlyArray<FieldDefinition<BooleanFieldModel>> = [this.am, this.pm];

    public getAm(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.am); }
    public getCicaNumber(): StringFieldModel { return this.get<StringFieldModel>(this.cicaNumber); }
    public getCitationNumber(): StringFieldModel { return this.get<StringFieldModel>(this.citationNumber); }
    public getDay(): StringFieldModel { return this.get<StringFieldModel>(this.day); }
    public getHour(): StringFieldModel { return this.get<StringFieldModel>(this.hour); }
    public getMinute(): StringFieldModel { return this.get<StringFieldModel>(this.minute); }
    public getMonth(): StringFieldModel { return this.get<StringFieldModel>(this.month); }
    public getNcicNumber(): StringFieldModel { return this.get<StringFieldModel>(this.ncicNumber); }
    public getPm(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.pm); }
    public getYear(): StringFieldModel { return this.get<StringFieldModel>(this.year); }

    /** Returns a section with the given half of the AM/PM pair checked and the other cleared. */
    public selectMeridiem(selected: FieldDefinition<BooleanFieldModel>): this {
        return selectExclusive(this, this.meridiem, selected);
    }
}

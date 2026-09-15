import { BooleanFieldModel, FieldDefinition, FormModel, ISection, SectionModel, StringFieldModel } from "@forms/core";
import { GAUTCFormSchema } from "../utc-form-schema";
import { selectExclusive } from "../exclusive-group";

export interface ISummonsSection extends ISection {
}

export interface ISummonsSectionModel extends ISummonsSection {
}

/**
 * Represents the model for Section IV (Summons) of the Georgia uniform traffic citation.
 *
 * As in the header, the court date is held as the separate day, month and year boxes the paper prints rather than
 * as one date. Three exclusive pairs sit in this section: the AM/PM of the appearance time, the copy / jail pair,
 * and the YES/NO of whether a licence was displayed in lieu of bail.
 */
export class SummonsSectionModel extends SectionModel implements ISummonsSectionModel {
    private schema: GAUTCFormSchema = FormModel.getSchema<GAUTCFormSchema>(SummonsSectionModel);

    public readonly appearanceDay: FieldDefinition<StringFieldModel> = this.schema.summonsFields.summonsAppearanceDay;
    public readonly appearanceMonth: FieldDefinition<StringFieldModel> = this.schema.summonsFields.summonsAppearanceMonth;
    public readonly appearanceYear: FieldDefinition<StringFieldModel> = this.schema.summonsFields.summonsAppearanceYear;
    public readonly hour: FieldDefinition<StringFieldModel> = this.schema.summonsFields.summonsHour;
    public readonly minute: FieldDefinition<StringFieldModel> = this.schema.summonsFields.summonsMinute;
    public readonly am: FieldDefinition<BooleanFieldModel> = this.schema.summonsFields.summonsAm;
    public readonly pm: FieldDefinition<BooleanFieldModel> = this.schema.summonsFields.summonsPm;
    public readonly courtName: FieldDefinition<StringFieldModel> = this.schema.summonsFields.summonsCourtName;
    public readonly city: FieldDefinition<StringFieldModel> = this.schema.summonsFields.summonsCity;
    public readonly copy: FieldDefinition<BooleanFieldModel> = this.schema.summonsFields.summonsCopy;
    public readonly jail: FieldDefinition<BooleanFieldModel> = this.schema.summonsFields.summonsJail;
    public readonly licenseDisplayedYes: FieldDefinition<BooleanFieldModel> = this.schema.summonsFields.summonsLicenseDisplayedYes;
    public readonly licenseDisplayedNo: FieldDefinition<BooleanFieldModel> = this.schema.summonsFields.summonsLicenseDisplayedNo;
    public readonly releaseTo: FieldDefinition<StringFieldModel> = this.schema.summonsFields.summonsReleaseTo;
    public readonly signature: FieldDefinition<StringFieldModel> = this.schema.summonsFields.summonsSignature;

    /** The copy / jail pair naming how the violator was disposed of. */
    public readonly disposition: ReadonlyArray<FieldDefinition<BooleanFieldModel>> = [this.copy, this.jail];
    /** The YES/NO pair recording whether a licence was displayed in lieu of bail. */
    public readonly licenseDisplayed: ReadonlyArray<FieldDefinition<BooleanFieldModel>> = [this.licenseDisplayedYes, this.licenseDisplayedNo];
    /** The AM/PM pair of the appearance time. */
    public readonly meridiem: ReadonlyArray<FieldDefinition<BooleanFieldModel>> = [this.am, this.pm];

    public getAm(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.am); }
    public getAppearanceDay(): StringFieldModel { return this.get<StringFieldModel>(this.appearanceDay); }
    public getAppearanceMonth(): StringFieldModel { return this.get<StringFieldModel>(this.appearanceMonth); }
    public getAppearanceYear(): StringFieldModel { return this.get<StringFieldModel>(this.appearanceYear); }
    public getCity(): StringFieldModel { return this.get<StringFieldModel>(this.city); }
    public getCopy(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.copy); }
    public getCourtName(): StringFieldModel { return this.get<StringFieldModel>(this.courtName); }
    public getHour(): StringFieldModel { return this.get<StringFieldModel>(this.hour); }
    public getJail(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.jail); }
    public getLicenseDisplayedNo(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.licenseDisplayedNo); }
    public getLicenseDisplayedYes(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.licenseDisplayedYes); }
    public getMinute(): StringFieldModel { return this.get<StringFieldModel>(this.minute); }
    public getPm(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.pm); }
    public getReleaseTo(): StringFieldModel { return this.get<StringFieldModel>(this.releaseTo); }
    public getSignature(): StringFieldModel { return this.get<StringFieldModel>(this.signature); }

    /** Returns a section with the given half of the copy / jail pair checked and the other cleared. */
    public selectDisposition(selected: FieldDefinition<BooleanFieldModel>): this {
        return selectExclusive(this, this.disposition, selected);
    }

    /** Returns a section with the given half of the licence displayed pair checked and the other cleared. */
    public selectLicenseDisplayed(selected: FieldDefinition<BooleanFieldModel>): this {
        return selectExclusive(this, this.licenseDisplayed, selected);
    }

    /** Returns a section with the given half of the AM/PM pair checked and the other cleared. */
    public selectMeridiem(selected: FieldDefinition<BooleanFieldModel>): this {
        return selectExclusive(this, this.meridiem, selected);
    }
}

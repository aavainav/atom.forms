import { ISection, BooleanFieldModel, FieldDefinition, SectionModel, StringFieldModel } from "@forms/core";
import { GAUTCFormSchema } from "../utc-form-schema";
import { selectExclusive } from "../exclusive-group";

export interface IDuiSection extends ISection {
}

export interface IDuiSectionModel extends IDuiSection {
}

/**
 * Represents the model for the DUI boxes of Section II of the Georgia uniform traffic citation.
 *
 * The DUI box itself is an independent flag; the blood / breath / urine / other boxes beside it are one exclusive
 * group naming the single test that was administered.
 */
export class DuiSectionModel extends SectionModel implements IDuiSectionModel {
    private formSchema: GAUTCFormSchema = this.getSchema<GAUTCFormSchema>();

    public readonly charged: FieldDefinition<BooleanFieldModel> = this.formSchema.duiFields.duiCharged;
    public readonly testBlood: FieldDefinition<BooleanFieldModel> = this.formSchema.duiFields.duiTestBlood;
    public readonly testBreath: FieldDefinition<BooleanFieldModel> = this.formSchema.duiFields.duiTestBreath;
    public readonly testUrine: FieldDefinition<BooleanFieldModel> = this.formSchema.duiFields.duiTestUrine;
    public readonly testOther: FieldDefinition<BooleanFieldModel> = this.formSchema.duiFields.duiTestOther;
    public readonly testResults: FieldDefinition<StringFieldModel> = this.formSchema.duiFields.duiTestResults;
    public readonly testAdministeredBy: FieldDefinition<StringFieldModel> = this.formSchema.duiFields.duiTestAdministeredBy;

    /** The blood / breath / urine / other group naming the test that was administered. */
    public readonly testAdministered: ReadonlyArray<FieldDefinition<BooleanFieldModel>> = [this.testBlood, this.testBreath, this.testUrine, this.testOther];

    public getCharged(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.charged); }
    public getTestAdministeredBy(): StringFieldModel { return this.get<StringFieldModel>(this.testAdministeredBy); }
    public getTestBlood(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.testBlood); }
    public getTestBreath(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.testBreath); }
    public getTestOther(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.testOther); }
    public getTestResults(): StringFieldModel { return this.get<StringFieldModel>(this.testResults); }
    public getTestUrine(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.testUrine); }

    /** Returns a section with the given test checked and the rest of the group cleared. */
    public selectTestAdministered(selected: FieldDefinition<BooleanFieldModel>): this {
        return selectExclusive(this, this.testAdministered, selected);
    }
}

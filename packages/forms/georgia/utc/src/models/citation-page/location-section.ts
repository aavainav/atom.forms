import { ISection, FieldDefinition, OptionFieldModel, SectionModel, StringFieldModel } from "@forms/core";
import { GAUTCFormSchema } from "../utc-form-schema";

export interface ILocationSection extends ISection {
}

export interface ILocationSectionModel extends ILocationSection {
}

/**
 * Represents the model for Section III (Location) of the Georgia uniform traffic citation.
 *
 * The county is an option field drawn from `ga-utc:county`, which holds the three counties the citation prints
 * beside the box rather than every county in Georgia.
 */
export class LocationSectionModel extends SectionModel implements ILocationSectionModel {
    private formSchema: GAUTCFormSchema = this.getSchema<GAUTCFormSchema>();

    public readonly city: FieldDefinition<StringFieldModel> = this.formSchema.locationFields.locationCity;
    public readonly county: FieldDefinition<OptionFieldModel> = this.formSchema.locationFields.locationCounty;
    public readonly street: FieldDefinition<StringFieldModel> = this.formSchema.locationFields.locationStreet;

    public getCity(): StringFieldModel { return this.get<StringFieldModel>(this.city); }
    public getCounty(): OptionFieldModel { return this.get<OptionFieldModel>(this.county); }
    public getStreet(): StringFieldModel { return this.get<StringFieldModel>(this.street); }
}

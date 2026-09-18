import { FieldDefinition, FormModel, ISection, OptionFieldModel, SectionModel, StringFieldModel } from "@forms/core";
import { GAUTCFormSchema } from "../utc-form-schema";

export interface ILocationSection extends ISection {
}

export interface ILocationSectionModel extends ILocationSection {
}

/** Model for Section III (Location). County is an option field drawn from `ga-utc:county`, holding the three counties the citation prints beside the box, not every county in Georgia. */
export class LocationSectionModel extends SectionModel implements ILocationSectionModel {
    private schema: GAUTCFormSchema = FormModel.getSchema<GAUTCFormSchema>(LocationSectionModel);

    public readonly city: FieldDefinition<StringFieldModel> = this.schema.locationFields.locationCity;
    public readonly county: FieldDefinition<OptionFieldModel> = this.schema.locationFields.locationCounty;
    public readonly street: FieldDefinition<StringFieldModel> = this.schema.locationFields.locationStreet;

    public getCity(): StringFieldModel { return this.get<StringFieldModel>(this.city); }
    public getCounty(): OptionFieldModel { return this.get<OptionFieldModel>(this.county); }
    public getStreet(): StringFieldModel { return this.get<StringFieldModel>(this.street); }
}

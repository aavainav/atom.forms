import { ISection, FieldDefinition, OptionFieldModel, SectionModel, StringFieldModel } from "@forms/core";
import { OKTrafficFormSchema } from "../traffic-form-schema";

export interface IStatusSection extends ISection {
}

export interface IStatusSectionModel extends IStatusSection {
}

/**
 * Represents the model for the status flags of the traffic citation form's supplement page.
 *
 * The page repeats an ethnicity box of its own alongside the one the complaint page carries in the defendant's
 * description; both are kept, since the printed form asks for both and nothing here can tell which the officer
 * means to be authoritative.
 *
 * The jailed status, release type, direction of travel and assignment are free text rather than option fields:
 * the printed form takes a code in each, but Oklahoma City's code sets for them are not published with the form.
 */
export class StatusSectionModel extends SectionModel implements IStatusSectionModel {
    private formSchema: OKTrafficFormSchema = this.getSchema<OKTrafficFormSchema>();

    public readonly signed: FieldDefinition<OptionFieldModel> = this.formSchema.statusFields.statusSigned;
    public readonly requestWarrant: FieldDefinition<OptionFieldModel> = this.formSchema.statusFields.statusRequestWarrant;
    public readonly mainPhone: FieldDefinition<StringFieldModel> = this.formSchema.statusFields.statusMainPhone;
    public readonly directionOfTravel: FieldDefinition<StringFieldModel> = this.formSchema.statusFields.statusDirectionOfTravel;
    public readonly jailed: FieldDefinition<StringFieldModel> = this.formSchema.statusFields.statusJailed;
    public readonly trailerTag: FieldDefinition<StringFieldModel> = this.formSchema.statusFields.statusTrailerTag;
    public readonly releaseType: FieldDefinition<StringFieldModel> = this.formSchema.statusFields.statusReleaseType;
    public readonly trailerState: FieldDefinition<OptionFieldModel> = this.formSchema.statusFields.statusTrailerState;
    public readonly tribe: FieldDefinition<StringFieldModel> = this.formSchema.statusFields.statusTribe;
    public readonly schoolZone: FieldDefinition<OptionFieldModel> = this.formSchema.statusFields.statusSchoolZone;
    public readonly voidReason: FieldDefinition<StringFieldModel> = this.formSchema.statusFields.statusVoidReason;
    public readonly constructionWorkZone: FieldDefinition<OptionFieldModel> = this.formSchema.statusFields.statusConstructionWorkZone;
    public readonly assignment: FieldDefinition<StringFieldModel> = this.formSchema.statusFields.statusAssignment;
    public readonly ethnicity: FieldDefinition<StringFieldModel> = this.formSchema.statusFields.statusEthnicity;
    public readonly transient: FieldDefinition<OptionFieldModel> = this.formSchema.statusFields.statusTransient;
    public readonly witnessCaptured: FieldDefinition<OptionFieldModel> = this.formSchema.statusFields.statusWitnessCaptured;
    public readonly noLicensePlate: FieldDefinition<OptionFieldModel> = this.formSchema.statusFields.statusNoLicensePlate;

    public getAssignment(): StringFieldModel { return this.get<StringFieldModel>(this.assignment); }
    public getConstructionWorkZone(): OptionFieldModel { return this.get<OptionFieldModel>(this.constructionWorkZone); }
    public getDirectionOfTravel(): StringFieldModel { return this.get<StringFieldModel>(this.directionOfTravel); }
    public getEthnicity(): StringFieldModel { return this.get<StringFieldModel>(this.ethnicity); }
    public getJailed(): StringFieldModel { return this.get<StringFieldModel>(this.jailed); }
    public getMainPhone(): StringFieldModel { return this.get<StringFieldModel>(this.mainPhone); }
    public getNoLicensePlate(): OptionFieldModel { return this.get<OptionFieldModel>(this.noLicensePlate); }
    public getReleaseType(): StringFieldModel { return this.get<StringFieldModel>(this.releaseType); }
    public getRequestWarrant(): OptionFieldModel { return this.get<OptionFieldModel>(this.requestWarrant); }
    public getSchoolZone(): OptionFieldModel { return this.get<OptionFieldModel>(this.schoolZone); }
    public getSigned(): OptionFieldModel { return this.get<OptionFieldModel>(this.signed); }
    public getTrailerState(): OptionFieldModel { return this.get<OptionFieldModel>(this.trailerState); }
    public getTrailerTag(): StringFieldModel { return this.get<StringFieldModel>(this.trailerTag); }
    public getTransient(): OptionFieldModel { return this.get<OptionFieldModel>(this.transient); }
    public getTribe(): StringFieldModel { return this.get<StringFieldModel>(this.tribe); }
    public getVoidReason(): StringFieldModel { return this.get<StringFieldModel>(this.voidReason); }
    public getWitnessCaptured(): OptionFieldModel { return this.get<OptionFieldModel>(this.witnessCaptured); }
}

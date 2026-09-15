import { FieldDefinition, FormModel, ISection, OptionFieldModel, SectionModel, StringFieldModel } from "@forms/core";
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
    private schema: OKTrafficFormSchema = FormModel.getSchema<OKTrafficFormSchema>(StatusSectionModel);

    public readonly signed: FieldDefinition<OptionFieldModel> = this.schema.statusFields.statusSigned;
    public readonly requestWarrant: FieldDefinition<OptionFieldModel> = this.schema.statusFields.statusRequestWarrant;
    public readonly mainPhone: FieldDefinition<StringFieldModel> = this.schema.statusFields.statusMainPhone;
    public readonly directionOfTravel: FieldDefinition<StringFieldModel> = this.schema.statusFields.statusDirectionOfTravel;
    public readonly jailed: FieldDefinition<StringFieldModel> = this.schema.statusFields.statusJailed;
    public readonly trailerTag: FieldDefinition<StringFieldModel> = this.schema.statusFields.statusTrailerTag;
    public readonly releaseType: FieldDefinition<StringFieldModel> = this.schema.statusFields.statusReleaseType;
    public readonly trailerState: FieldDefinition<OptionFieldModel> = this.schema.statusFields.statusTrailerState;
    public readonly tribe: FieldDefinition<StringFieldModel> = this.schema.statusFields.statusTribe;
    public readonly schoolZone: FieldDefinition<OptionFieldModel> = this.schema.statusFields.statusSchoolZone;
    public readonly voidReason: FieldDefinition<StringFieldModel> = this.schema.statusFields.statusVoidReason;
    public readonly constructionWorkZone: FieldDefinition<OptionFieldModel> = this.schema.statusFields.statusConstructionWorkZone;
    public readonly assignment: FieldDefinition<StringFieldModel> = this.schema.statusFields.statusAssignment;
    public readonly ethnicity: FieldDefinition<StringFieldModel> = this.schema.statusFields.statusEthnicity;
    public readonly transient: FieldDefinition<OptionFieldModel> = this.schema.statusFields.statusTransient;
    public readonly witnessCaptured: FieldDefinition<OptionFieldModel> = this.schema.statusFields.statusWitnessCaptured;
    public readonly noLicensePlate: FieldDefinition<OptionFieldModel> = this.schema.statusFields.statusNoLicensePlate;

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

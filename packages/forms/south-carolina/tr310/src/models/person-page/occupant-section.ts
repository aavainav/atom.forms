import { ISection, FieldDefinition, OptionFieldModel, SectionModel, StringFieldModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface IOccupantSection extends ISection {
}

export interface IOccupantSectionModel extends IOccupantSection {
}

/** Represents the model for how the person rode and what happened to them - where they sat, whether they were ejected, and what restrained them. */
export class OccupantSectionModel extends SectionModel implements IOccupantSectionModel {
    private formSchema: TR310FormSchema = this.getSchema<TR310FormSchema>();

    public readonly seatingLocation: FieldDefinition<StringFieldModel> = this.formSchema.occupantFields.occupantSeatingLocation;
    public readonly ejection: FieldDefinition<OptionFieldModel> = this.formSchema.occupantFields.occupantEjection;
    public readonly medicalFacilityTransport: FieldDefinition<OptionFieldModel> = this.formSchema.occupantFields.occupantMedicalFacilityTransport;
    public readonly headInjury: FieldDefinition<OptionFieldModel> = this.formSchema.occupantFields.occupantHeadInjury;
    public readonly airBagDeployment: FieldDefinition<OptionFieldModel> = this.formSchema.occupantFields.occupantAirBagDeployment;
    public readonly restraintDevice: FieldDefinition<OptionFieldModel> = this.formSchema.occupantFields.occupantRestraintDevice;

    public getSeatingLocation(): StringFieldModel { return this.get<StringFieldModel>(this.seatingLocation); }
    public getEjection(): OptionFieldModel { return this.get<OptionFieldModel>(this.ejection); }
    public getMedicalFacilityTransport(): OptionFieldModel { return this.get<OptionFieldModel>(this.medicalFacilityTransport); }
    public getHeadInjury(): OptionFieldModel { return this.get<OptionFieldModel>(this.headInjury); }
    public getAirBagDeployment(): OptionFieldModel { return this.get<OptionFieldModel>(this.airBagDeployment); }
    public getRestraintDevice(): OptionFieldModel { return this.get<OptionFieldModel>(this.restraintDevice); }
}

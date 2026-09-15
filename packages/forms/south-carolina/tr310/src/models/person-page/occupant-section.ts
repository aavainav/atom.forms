import { FieldDefinition, FormModel, ISection, OptionFieldModel, SectionModel, StringFieldModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface IOccupantSection extends ISection {
}

export interface IOccupantSectionModel extends IOccupantSection {
}

/** Represents the model for how the person rode and what happened to them - where they sat, whether they were ejected, and what restrained them. */
export class OccupantSectionModel extends SectionModel implements IOccupantSectionModel {
    private schema: TR310FormSchema = FormModel.getSchema<TR310FormSchema>(OccupantSectionModel);

    public readonly seatingLocation: FieldDefinition<StringFieldModel> = this.schema.occupantFields.occupantSeatingLocation;
    public readonly ejection: FieldDefinition<OptionFieldModel> = this.schema.occupantFields.occupantEjection;
    public readonly medicalFacilityTransport: FieldDefinition<OptionFieldModel> = this.schema.occupantFields.occupantMedicalFacilityTransport;
    public readonly headInjury: FieldDefinition<OptionFieldModel> = this.schema.occupantFields.occupantHeadInjury;
    public readonly airBagDeployment: FieldDefinition<OptionFieldModel> = this.schema.occupantFields.occupantAirBagDeployment;
    public readonly restraintDevice: FieldDefinition<OptionFieldModel> = this.schema.occupantFields.occupantRestraintDevice;

    public getSeatingLocation(): StringFieldModel { return this.get<StringFieldModel>(this.seatingLocation); }
    public getEjection(): OptionFieldModel { return this.get<OptionFieldModel>(this.ejection); }
    public getMedicalFacilityTransport(): OptionFieldModel { return this.get<OptionFieldModel>(this.medicalFacilityTransport); }
    public getHeadInjury(): OptionFieldModel { return this.get<OptionFieldModel>(this.headInjury); }
    public getAirBagDeployment(): OptionFieldModel { return this.get<OptionFieldModel>(this.airBagDeployment); }
    public getRestraintDevice(): OptionFieldModel { return this.get<OptionFieldModel>(this.restraintDevice); }
}

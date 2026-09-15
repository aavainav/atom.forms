import { FieldDefinition, FormModel, ISection, OptionFieldModel, SectionModel, StringFieldModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface IAdditionalPassengersSection extends ISection {
}

export interface IAdditionalPassengersSectionModel extends IAdditionalPassengersSection {
}

/** Represents the model for the four additional passenger rows the narrative page carries, which take the same columns as the person page's own passenger rows. */
export class AdditionalPassengersSectionModel extends SectionModel implements IAdditionalPassengersSectionModel {
    private schema: TR310FormSchema = FormModel.getSchema<TR310FormSchema>(AdditionalPassengersSectionModel);

    public readonly onePersonNumber: FieldDefinition<StringFieldModel> = this.schema.additionalPassengersFields.additionalPassengerOnePersonNumber;
    public readonly oneUnitNumber: FieldDefinition<StringFieldModel> = this.schema.additionalPassengersFields.additionalPassengerOneUnitNumber;
    public readonly oneNameAndAddress: FieldDefinition<StringFieldModel> = this.schema.additionalPassengersFields.additionalPassengerOneNameAndAddress;
    public readonly oneDateOfBirth: FieldDefinition<StringFieldModel> = this.schema.additionalPassengersFields.additionalPassengerOneDateOfBirth;
    public readonly oneInjuryStatus: FieldDefinition<OptionFieldModel> = this.schema.additionalPassengersFields.additionalPassengerOneInjuryStatus;
    public readonly oneSex: FieldDefinition<OptionFieldModel> = this.schema.additionalPassengersFields.additionalPassengerOneSex;
    public readonly oneRace: FieldDefinition<StringFieldModel> = this.schema.additionalPassengersFields.additionalPassengerOneRace;
    public readonly oneSeatingLocation: FieldDefinition<StringFieldModel> = this.schema.additionalPassengersFields.additionalPassengerOneSeatingLocation;
    public readonly oneEjection: FieldDefinition<OptionFieldModel> = this.schema.additionalPassengersFields.additionalPassengerOneEjection;
    public readonly oneMedicalFacilityTransport: FieldDefinition<OptionFieldModel> = this.schema.additionalPassengersFields.additionalPassengerOneMedicalFacilityTransport;
    public readonly oneAirBagDeployment: FieldDefinition<OptionFieldModel> = this.schema.additionalPassengersFields.additionalPassengerOneAirBagDeployment;
    public readonly oneSafetyEquipment: FieldDefinition<OptionFieldModel> = this.schema.additionalPassengersFields.additionalPassengerOneSafetyEquipment;
    public readonly oneRestraintDevice: FieldDefinition<OptionFieldModel> = this.schema.additionalPassengersFields.additionalPassengerOneRestraintDevice;
    public readonly oneHeadInjury: FieldDefinition<OptionFieldModel> = this.schema.additionalPassengersFields.additionalPassengerOneHeadInjury;
    public readonly twoPersonNumber: FieldDefinition<StringFieldModel> = this.schema.additionalPassengersFields.additionalPassengerTwoPersonNumber;
    public readonly twoUnitNumber: FieldDefinition<StringFieldModel> = this.schema.additionalPassengersFields.additionalPassengerTwoUnitNumber;
    public readonly twoNameAndAddress: FieldDefinition<StringFieldModel> = this.schema.additionalPassengersFields.additionalPassengerTwoNameAndAddress;
    public readonly twoDateOfBirth: FieldDefinition<StringFieldModel> = this.schema.additionalPassengersFields.additionalPassengerTwoDateOfBirth;
    public readonly twoInjuryStatus: FieldDefinition<OptionFieldModel> = this.schema.additionalPassengersFields.additionalPassengerTwoInjuryStatus;
    public readonly twoSex: FieldDefinition<OptionFieldModel> = this.schema.additionalPassengersFields.additionalPassengerTwoSex;
    public readonly twoRace: FieldDefinition<StringFieldModel> = this.schema.additionalPassengersFields.additionalPassengerTwoRace;
    public readonly twoSeatingLocation: FieldDefinition<StringFieldModel> = this.schema.additionalPassengersFields.additionalPassengerTwoSeatingLocation;
    public readonly twoEjection: FieldDefinition<OptionFieldModel> = this.schema.additionalPassengersFields.additionalPassengerTwoEjection;
    public readonly twoMedicalFacilityTransport: FieldDefinition<OptionFieldModel> = this.schema.additionalPassengersFields.additionalPassengerTwoMedicalFacilityTransport;
    public readonly twoAirBagDeployment: FieldDefinition<OptionFieldModel> = this.schema.additionalPassengersFields.additionalPassengerTwoAirBagDeployment;
    public readonly twoSafetyEquipment: FieldDefinition<OptionFieldModel> = this.schema.additionalPassengersFields.additionalPassengerTwoSafetyEquipment;
    public readonly twoRestraintDevice: FieldDefinition<OptionFieldModel> = this.schema.additionalPassengersFields.additionalPassengerTwoRestraintDevice;
    public readonly twoHeadInjury: FieldDefinition<OptionFieldModel> = this.schema.additionalPassengersFields.additionalPassengerTwoHeadInjury;
    public readonly threePersonNumber: FieldDefinition<StringFieldModel> = this.schema.additionalPassengersFields.additionalPassengerThreePersonNumber;
    public readonly threeUnitNumber: FieldDefinition<StringFieldModel> = this.schema.additionalPassengersFields.additionalPassengerThreeUnitNumber;
    public readonly threeNameAndAddress: FieldDefinition<StringFieldModel> = this.schema.additionalPassengersFields.additionalPassengerThreeNameAndAddress;
    public readonly threeDateOfBirth: FieldDefinition<StringFieldModel> = this.schema.additionalPassengersFields.additionalPassengerThreeDateOfBirth;
    public readonly threeInjuryStatus: FieldDefinition<OptionFieldModel> = this.schema.additionalPassengersFields.additionalPassengerThreeInjuryStatus;
    public readonly threeSex: FieldDefinition<OptionFieldModel> = this.schema.additionalPassengersFields.additionalPassengerThreeSex;
    public readonly threeRace: FieldDefinition<StringFieldModel> = this.schema.additionalPassengersFields.additionalPassengerThreeRace;
    public readonly threeSeatingLocation: FieldDefinition<StringFieldModel> = this.schema.additionalPassengersFields.additionalPassengerThreeSeatingLocation;
    public readonly threeEjection: FieldDefinition<OptionFieldModel> = this.schema.additionalPassengersFields.additionalPassengerThreeEjection;
    public readonly threeMedicalFacilityTransport: FieldDefinition<OptionFieldModel> = this.schema.additionalPassengersFields.additionalPassengerThreeMedicalFacilityTransport;
    public readonly threeAirBagDeployment: FieldDefinition<OptionFieldModel> = this.schema.additionalPassengersFields.additionalPassengerThreeAirBagDeployment;
    public readonly threeSafetyEquipment: FieldDefinition<OptionFieldModel> = this.schema.additionalPassengersFields.additionalPassengerThreeSafetyEquipment;
    public readonly threeRestraintDevice: FieldDefinition<OptionFieldModel> = this.schema.additionalPassengersFields.additionalPassengerThreeRestraintDevice;
    public readonly threeHeadInjury: FieldDefinition<OptionFieldModel> = this.schema.additionalPassengersFields.additionalPassengerThreeHeadInjury;
    public readonly fourPersonNumber: FieldDefinition<StringFieldModel> = this.schema.additionalPassengersFields.additionalPassengerFourPersonNumber;
    public readonly fourUnitNumber: FieldDefinition<StringFieldModel> = this.schema.additionalPassengersFields.additionalPassengerFourUnitNumber;
    public readonly fourNameAndAddress: FieldDefinition<StringFieldModel> = this.schema.additionalPassengersFields.additionalPassengerFourNameAndAddress;
    public readonly fourDateOfBirth: FieldDefinition<StringFieldModel> = this.schema.additionalPassengersFields.additionalPassengerFourDateOfBirth;
    public readonly fourInjuryStatus: FieldDefinition<OptionFieldModel> = this.schema.additionalPassengersFields.additionalPassengerFourInjuryStatus;
    public readonly fourSex: FieldDefinition<OptionFieldModel> = this.schema.additionalPassengersFields.additionalPassengerFourSex;
    public readonly fourRace: FieldDefinition<StringFieldModel> = this.schema.additionalPassengersFields.additionalPassengerFourRace;
    public readonly fourSeatingLocation: FieldDefinition<StringFieldModel> = this.schema.additionalPassengersFields.additionalPassengerFourSeatingLocation;
    public readonly fourEjection: FieldDefinition<OptionFieldModel> = this.schema.additionalPassengersFields.additionalPassengerFourEjection;
    public readonly fourMedicalFacilityTransport: FieldDefinition<OptionFieldModel> = this.schema.additionalPassengersFields.additionalPassengerFourMedicalFacilityTransport;
    public readonly fourAirBagDeployment: FieldDefinition<OptionFieldModel> = this.schema.additionalPassengersFields.additionalPassengerFourAirBagDeployment;
    public readonly fourSafetyEquipment: FieldDefinition<OptionFieldModel> = this.schema.additionalPassengersFields.additionalPassengerFourSafetyEquipment;
    public readonly fourRestraintDevice: FieldDefinition<OptionFieldModel> = this.schema.additionalPassengersFields.additionalPassengerFourRestraintDevice;
    public readonly fourHeadInjury: FieldDefinition<OptionFieldModel> = this.schema.additionalPassengersFields.additionalPassengerFourHeadInjury;

    public getOnePersonNumber(): StringFieldModel { return this.get<StringFieldModel>(this.onePersonNumber); }
    public getOneUnitNumber(): StringFieldModel { return this.get<StringFieldModel>(this.oneUnitNumber); }
    public getOneNameAndAddress(): StringFieldModel { return this.get<StringFieldModel>(this.oneNameAndAddress); }
    public getOneDateOfBirth(): StringFieldModel { return this.get<StringFieldModel>(this.oneDateOfBirth); }
    public getOneInjuryStatus(): OptionFieldModel { return this.get<OptionFieldModel>(this.oneInjuryStatus); }
    public getOneSex(): OptionFieldModel { return this.get<OptionFieldModel>(this.oneSex); }
    public getOneRace(): StringFieldModel { return this.get<StringFieldModel>(this.oneRace); }
    public getOneSeatingLocation(): StringFieldModel { return this.get<StringFieldModel>(this.oneSeatingLocation); }
    public getOneEjection(): OptionFieldModel { return this.get<OptionFieldModel>(this.oneEjection); }
    public getOneMedicalFacilityTransport(): OptionFieldModel { return this.get<OptionFieldModel>(this.oneMedicalFacilityTransport); }
    public getOneAirBagDeployment(): OptionFieldModel { return this.get<OptionFieldModel>(this.oneAirBagDeployment); }
    public getOneSafetyEquipment(): OptionFieldModel { return this.get<OptionFieldModel>(this.oneSafetyEquipment); }
    public getOneRestraintDevice(): OptionFieldModel { return this.get<OptionFieldModel>(this.oneRestraintDevice); }
    public getOneHeadInjury(): OptionFieldModel { return this.get<OptionFieldModel>(this.oneHeadInjury); }
    public getTwoPersonNumber(): StringFieldModel { return this.get<StringFieldModel>(this.twoPersonNumber); }
    public getTwoUnitNumber(): StringFieldModel { return this.get<StringFieldModel>(this.twoUnitNumber); }
    public getTwoNameAndAddress(): StringFieldModel { return this.get<StringFieldModel>(this.twoNameAndAddress); }
    public getTwoDateOfBirth(): StringFieldModel { return this.get<StringFieldModel>(this.twoDateOfBirth); }
    public getTwoInjuryStatus(): OptionFieldModel { return this.get<OptionFieldModel>(this.twoInjuryStatus); }
    public getTwoSex(): OptionFieldModel { return this.get<OptionFieldModel>(this.twoSex); }
    public getTwoRace(): StringFieldModel { return this.get<StringFieldModel>(this.twoRace); }
    public getTwoSeatingLocation(): StringFieldModel { return this.get<StringFieldModel>(this.twoSeatingLocation); }
    public getTwoEjection(): OptionFieldModel { return this.get<OptionFieldModel>(this.twoEjection); }
    public getTwoMedicalFacilityTransport(): OptionFieldModel { return this.get<OptionFieldModel>(this.twoMedicalFacilityTransport); }
    public getTwoAirBagDeployment(): OptionFieldModel { return this.get<OptionFieldModel>(this.twoAirBagDeployment); }
    public getTwoSafetyEquipment(): OptionFieldModel { return this.get<OptionFieldModel>(this.twoSafetyEquipment); }
    public getTwoRestraintDevice(): OptionFieldModel { return this.get<OptionFieldModel>(this.twoRestraintDevice); }
    public getTwoHeadInjury(): OptionFieldModel { return this.get<OptionFieldModel>(this.twoHeadInjury); }
    public getThreePersonNumber(): StringFieldModel { return this.get<StringFieldModel>(this.threePersonNumber); }
    public getThreeUnitNumber(): StringFieldModel { return this.get<StringFieldModel>(this.threeUnitNumber); }
    public getThreeNameAndAddress(): StringFieldModel { return this.get<StringFieldModel>(this.threeNameAndAddress); }
    public getThreeDateOfBirth(): StringFieldModel { return this.get<StringFieldModel>(this.threeDateOfBirth); }
    public getThreeInjuryStatus(): OptionFieldModel { return this.get<OptionFieldModel>(this.threeInjuryStatus); }
    public getThreeSex(): OptionFieldModel { return this.get<OptionFieldModel>(this.threeSex); }
    public getThreeRace(): StringFieldModel { return this.get<StringFieldModel>(this.threeRace); }
    public getThreeSeatingLocation(): StringFieldModel { return this.get<StringFieldModel>(this.threeSeatingLocation); }
    public getThreeEjection(): OptionFieldModel { return this.get<OptionFieldModel>(this.threeEjection); }
    public getThreeMedicalFacilityTransport(): OptionFieldModel { return this.get<OptionFieldModel>(this.threeMedicalFacilityTransport); }
    public getThreeAirBagDeployment(): OptionFieldModel { return this.get<OptionFieldModel>(this.threeAirBagDeployment); }
    public getThreeSafetyEquipment(): OptionFieldModel { return this.get<OptionFieldModel>(this.threeSafetyEquipment); }
    public getThreeRestraintDevice(): OptionFieldModel { return this.get<OptionFieldModel>(this.threeRestraintDevice); }
    public getThreeHeadInjury(): OptionFieldModel { return this.get<OptionFieldModel>(this.threeHeadInjury); }
    public getFourPersonNumber(): StringFieldModel { return this.get<StringFieldModel>(this.fourPersonNumber); }
    public getFourUnitNumber(): StringFieldModel { return this.get<StringFieldModel>(this.fourUnitNumber); }
    public getFourNameAndAddress(): StringFieldModel { return this.get<StringFieldModel>(this.fourNameAndAddress); }
    public getFourDateOfBirth(): StringFieldModel { return this.get<StringFieldModel>(this.fourDateOfBirth); }
    public getFourInjuryStatus(): OptionFieldModel { return this.get<OptionFieldModel>(this.fourInjuryStatus); }
    public getFourSex(): OptionFieldModel { return this.get<OptionFieldModel>(this.fourSex); }
    public getFourRace(): StringFieldModel { return this.get<StringFieldModel>(this.fourRace); }
    public getFourSeatingLocation(): StringFieldModel { return this.get<StringFieldModel>(this.fourSeatingLocation); }
    public getFourEjection(): OptionFieldModel { return this.get<OptionFieldModel>(this.fourEjection); }
    public getFourMedicalFacilityTransport(): OptionFieldModel { return this.get<OptionFieldModel>(this.fourMedicalFacilityTransport); }
    public getFourAirBagDeployment(): OptionFieldModel { return this.get<OptionFieldModel>(this.fourAirBagDeployment); }
    public getFourSafetyEquipment(): OptionFieldModel { return this.get<OptionFieldModel>(this.fourSafetyEquipment); }
    public getFourRestraintDevice(): OptionFieldModel { return this.get<OptionFieldModel>(this.fourRestraintDevice); }
    public getFourHeadInjury(): OptionFieldModel { return this.get<OptionFieldModel>(this.fourHeadInjury); }
}

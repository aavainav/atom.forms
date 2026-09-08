import { ISection, FieldDefinition, FormModel, OptionFieldModel, SectionModel, StringFieldModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface IPassengersSection extends ISection {
}

export interface IPassengersSectionModel extends IPassengersSection {
}

/** Represents the model for the four passenger rows the person page carries. The form prints a fixed four rows, so they are four numbered groups of fields rather than a collection; a fifth passenger goes on the narrative page's additional passengers. */
export class PassengersSectionModel extends SectionModel implements IPassengersSectionModel {
    private schema: TR310FormSchema = FormModel.getSchema<TR310FormSchema>(TR310FormSchema);

    public readonly onePersonNumber: FieldDefinition<StringFieldModel> = this.schema.passengersFields.passengerOnePersonNumber;
    public readonly oneUnitNumber: FieldDefinition<StringFieldModel> = this.schema.passengersFields.passengerOneUnitNumber;
    public readonly oneNameAndAddress: FieldDefinition<StringFieldModel> = this.schema.passengersFields.passengerOneNameAndAddress;
    public readonly oneDateOfBirth: FieldDefinition<StringFieldModel> = this.schema.passengersFields.passengerOneDateOfBirth;
    public readonly oneInjuryStatus: FieldDefinition<OptionFieldModel> = this.schema.passengersFields.passengerOneInjuryStatus;
    public readonly oneSex: FieldDefinition<OptionFieldModel> = this.schema.passengersFields.passengerOneSex;
    public readonly oneRace: FieldDefinition<StringFieldModel> = this.schema.passengersFields.passengerOneRace;
    public readonly oneSeatingLocation: FieldDefinition<StringFieldModel> = this.schema.passengersFields.passengerOneSeatingLocation;
    public readonly oneEjection: FieldDefinition<OptionFieldModel> = this.schema.passengersFields.passengerOneEjection;
    public readonly oneMedicalFacilityTransport: FieldDefinition<OptionFieldModel> = this.schema.passengersFields.passengerOneMedicalFacilityTransport;
    public readonly oneAirBagDeployment: FieldDefinition<OptionFieldModel> = this.schema.passengersFields.passengerOneAirBagDeployment;
    public readonly oneSafetyEquipment: FieldDefinition<OptionFieldModel> = this.schema.passengersFields.passengerOneSafetyEquipment;
    public readonly oneRestraintDevice: FieldDefinition<OptionFieldModel> = this.schema.passengersFields.passengerOneRestraintDevice;
    public readonly oneHeadInjury: FieldDefinition<OptionFieldModel> = this.schema.passengersFields.passengerOneHeadInjury;
    public readonly twoPersonNumber: FieldDefinition<StringFieldModel> = this.schema.passengersFields.passengerTwoPersonNumber;
    public readonly twoUnitNumber: FieldDefinition<StringFieldModel> = this.schema.passengersFields.passengerTwoUnitNumber;
    public readonly twoNameAndAddress: FieldDefinition<StringFieldModel> = this.schema.passengersFields.passengerTwoNameAndAddress;
    public readonly twoDateOfBirth: FieldDefinition<StringFieldModel> = this.schema.passengersFields.passengerTwoDateOfBirth;
    public readonly twoInjuryStatus: FieldDefinition<OptionFieldModel> = this.schema.passengersFields.passengerTwoInjuryStatus;
    public readonly twoSex: FieldDefinition<OptionFieldModel> = this.schema.passengersFields.passengerTwoSex;
    public readonly twoRace: FieldDefinition<StringFieldModel> = this.schema.passengersFields.passengerTwoRace;
    public readonly twoSeatingLocation: FieldDefinition<StringFieldModel> = this.schema.passengersFields.passengerTwoSeatingLocation;
    public readonly twoEjection: FieldDefinition<OptionFieldModel> = this.schema.passengersFields.passengerTwoEjection;
    public readonly twoMedicalFacilityTransport: FieldDefinition<OptionFieldModel> = this.schema.passengersFields.passengerTwoMedicalFacilityTransport;
    public readonly twoAirBagDeployment: FieldDefinition<OptionFieldModel> = this.schema.passengersFields.passengerTwoAirBagDeployment;
    public readonly twoSafetyEquipment: FieldDefinition<OptionFieldModel> = this.schema.passengersFields.passengerTwoSafetyEquipment;
    public readonly twoRestraintDevice: FieldDefinition<OptionFieldModel> = this.schema.passengersFields.passengerTwoRestraintDevice;
    public readonly twoHeadInjury: FieldDefinition<OptionFieldModel> = this.schema.passengersFields.passengerTwoHeadInjury;
    public readonly threePersonNumber: FieldDefinition<StringFieldModel> = this.schema.passengersFields.passengerThreePersonNumber;
    public readonly threeUnitNumber: FieldDefinition<StringFieldModel> = this.schema.passengersFields.passengerThreeUnitNumber;
    public readonly threeNameAndAddress: FieldDefinition<StringFieldModel> = this.schema.passengersFields.passengerThreeNameAndAddress;
    public readonly threeDateOfBirth: FieldDefinition<StringFieldModel> = this.schema.passengersFields.passengerThreeDateOfBirth;
    public readonly threeInjuryStatus: FieldDefinition<OptionFieldModel> = this.schema.passengersFields.passengerThreeInjuryStatus;
    public readonly threeSex: FieldDefinition<OptionFieldModel> = this.schema.passengersFields.passengerThreeSex;
    public readonly threeRace: FieldDefinition<StringFieldModel> = this.schema.passengersFields.passengerThreeRace;
    public readonly threeSeatingLocation: FieldDefinition<StringFieldModel> = this.schema.passengersFields.passengerThreeSeatingLocation;
    public readonly threeEjection: FieldDefinition<OptionFieldModel> = this.schema.passengersFields.passengerThreeEjection;
    public readonly threeMedicalFacilityTransport: FieldDefinition<OptionFieldModel> = this.schema.passengersFields.passengerThreeMedicalFacilityTransport;
    public readonly threeAirBagDeployment: FieldDefinition<OptionFieldModel> = this.schema.passengersFields.passengerThreeAirBagDeployment;
    public readonly threeSafetyEquipment: FieldDefinition<OptionFieldModel> = this.schema.passengersFields.passengerThreeSafetyEquipment;
    public readonly threeRestraintDevice: FieldDefinition<OptionFieldModel> = this.schema.passengersFields.passengerThreeRestraintDevice;
    public readonly threeHeadInjury: FieldDefinition<OptionFieldModel> = this.schema.passengersFields.passengerThreeHeadInjury;
    public readonly fourPersonNumber: FieldDefinition<StringFieldModel> = this.schema.passengersFields.passengerFourPersonNumber;
    public readonly fourUnitNumber: FieldDefinition<StringFieldModel> = this.schema.passengersFields.passengerFourUnitNumber;
    public readonly fourNameAndAddress: FieldDefinition<StringFieldModel> = this.schema.passengersFields.passengerFourNameAndAddress;
    public readonly fourDateOfBirth: FieldDefinition<StringFieldModel> = this.schema.passengersFields.passengerFourDateOfBirth;
    public readonly fourInjuryStatus: FieldDefinition<OptionFieldModel> = this.schema.passengersFields.passengerFourInjuryStatus;
    public readonly fourSex: FieldDefinition<OptionFieldModel> = this.schema.passengersFields.passengerFourSex;
    public readonly fourRace: FieldDefinition<StringFieldModel> = this.schema.passengersFields.passengerFourRace;
    public readonly fourSeatingLocation: FieldDefinition<StringFieldModel> = this.schema.passengersFields.passengerFourSeatingLocation;
    public readonly fourEjection: FieldDefinition<OptionFieldModel> = this.schema.passengersFields.passengerFourEjection;
    public readonly fourMedicalFacilityTransport: FieldDefinition<OptionFieldModel> = this.schema.passengersFields.passengerFourMedicalFacilityTransport;
    public readonly fourAirBagDeployment: FieldDefinition<OptionFieldModel> = this.schema.passengersFields.passengerFourAirBagDeployment;
    public readonly fourSafetyEquipment: FieldDefinition<OptionFieldModel> = this.schema.passengersFields.passengerFourSafetyEquipment;
    public readonly fourRestraintDevice: FieldDefinition<OptionFieldModel> = this.schema.passengersFields.passengerFourRestraintDevice;
    public readonly fourHeadInjury: FieldDefinition<OptionFieldModel> = this.schema.passengersFields.passengerFourHeadInjury;

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

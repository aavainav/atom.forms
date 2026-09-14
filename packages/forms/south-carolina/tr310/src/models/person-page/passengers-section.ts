import { ISection, FieldDefinition, OptionFieldModel, SectionModel, StringFieldModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface IPassengersSection extends ISection {
}

export interface IPassengersSectionModel extends IPassengersSection {
}

/** Represents the model for the four passenger rows the person page carries. The form prints a fixed four rows, so they are four numbered groups of fields rather than a collection; a fifth passenger goes on the narrative page's additional passengers. */
export class PassengersSectionModel extends SectionModel implements IPassengersSectionModel {
    private formSchema: TR310FormSchema = this.getSchema<TR310FormSchema>();

    public readonly onePersonNumber: FieldDefinition<StringFieldModel> = this.formSchema.passengersFields.passengerOnePersonNumber;
    public readonly oneUnitNumber: FieldDefinition<StringFieldModel> = this.formSchema.passengersFields.passengerOneUnitNumber;
    public readonly oneNameAndAddress: FieldDefinition<StringFieldModel> = this.formSchema.passengersFields.passengerOneNameAndAddress;
    public readonly oneDateOfBirth: FieldDefinition<StringFieldModel> = this.formSchema.passengersFields.passengerOneDateOfBirth;
    public readonly oneInjuryStatus: FieldDefinition<OptionFieldModel> = this.formSchema.passengersFields.passengerOneInjuryStatus;
    public readonly oneSex: FieldDefinition<OptionFieldModel> = this.formSchema.passengersFields.passengerOneSex;
    public readonly oneRace: FieldDefinition<StringFieldModel> = this.formSchema.passengersFields.passengerOneRace;
    public readonly oneSeatingLocation: FieldDefinition<StringFieldModel> = this.formSchema.passengersFields.passengerOneSeatingLocation;
    public readonly oneEjection: FieldDefinition<OptionFieldModel> = this.formSchema.passengersFields.passengerOneEjection;
    public readonly oneMedicalFacilityTransport: FieldDefinition<OptionFieldModel> = this.formSchema.passengersFields.passengerOneMedicalFacilityTransport;
    public readonly oneAirBagDeployment: FieldDefinition<OptionFieldModel> = this.formSchema.passengersFields.passengerOneAirBagDeployment;
    public readonly oneSafetyEquipment: FieldDefinition<OptionFieldModel> = this.formSchema.passengersFields.passengerOneSafetyEquipment;
    public readonly oneRestraintDevice: FieldDefinition<OptionFieldModel> = this.formSchema.passengersFields.passengerOneRestraintDevice;
    public readonly oneHeadInjury: FieldDefinition<OptionFieldModel> = this.formSchema.passengersFields.passengerOneHeadInjury;
    public readonly twoPersonNumber: FieldDefinition<StringFieldModel> = this.formSchema.passengersFields.passengerTwoPersonNumber;
    public readonly twoUnitNumber: FieldDefinition<StringFieldModel> = this.formSchema.passengersFields.passengerTwoUnitNumber;
    public readonly twoNameAndAddress: FieldDefinition<StringFieldModel> = this.formSchema.passengersFields.passengerTwoNameAndAddress;
    public readonly twoDateOfBirth: FieldDefinition<StringFieldModel> = this.formSchema.passengersFields.passengerTwoDateOfBirth;
    public readonly twoInjuryStatus: FieldDefinition<OptionFieldModel> = this.formSchema.passengersFields.passengerTwoInjuryStatus;
    public readonly twoSex: FieldDefinition<OptionFieldModel> = this.formSchema.passengersFields.passengerTwoSex;
    public readonly twoRace: FieldDefinition<StringFieldModel> = this.formSchema.passengersFields.passengerTwoRace;
    public readonly twoSeatingLocation: FieldDefinition<StringFieldModel> = this.formSchema.passengersFields.passengerTwoSeatingLocation;
    public readonly twoEjection: FieldDefinition<OptionFieldModel> = this.formSchema.passengersFields.passengerTwoEjection;
    public readonly twoMedicalFacilityTransport: FieldDefinition<OptionFieldModel> = this.formSchema.passengersFields.passengerTwoMedicalFacilityTransport;
    public readonly twoAirBagDeployment: FieldDefinition<OptionFieldModel> = this.formSchema.passengersFields.passengerTwoAirBagDeployment;
    public readonly twoSafetyEquipment: FieldDefinition<OptionFieldModel> = this.formSchema.passengersFields.passengerTwoSafetyEquipment;
    public readonly twoRestraintDevice: FieldDefinition<OptionFieldModel> = this.formSchema.passengersFields.passengerTwoRestraintDevice;
    public readonly twoHeadInjury: FieldDefinition<OptionFieldModel> = this.formSchema.passengersFields.passengerTwoHeadInjury;
    public readonly threePersonNumber: FieldDefinition<StringFieldModel> = this.formSchema.passengersFields.passengerThreePersonNumber;
    public readonly threeUnitNumber: FieldDefinition<StringFieldModel> = this.formSchema.passengersFields.passengerThreeUnitNumber;
    public readonly threeNameAndAddress: FieldDefinition<StringFieldModel> = this.formSchema.passengersFields.passengerThreeNameAndAddress;
    public readonly threeDateOfBirth: FieldDefinition<StringFieldModel> = this.formSchema.passengersFields.passengerThreeDateOfBirth;
    public readonly threeInjuryStatus: FieldDefinition<OptionFieldModel> = this.formSchema.passengersFields.passengerThreeInjuryStatus;
    public readonly threeSex: FieldDefinition<OptionFieldModel> = this.formSchema.passengersFields.passengerThreeSex;
    public readonly threeRace: FieldDefinition<StringFieldModel> = this.formSchema.passengersFields.passengerThreeRace;
    public readonly threeSeatingLocation: FieldDefinition<StringFieldModel> = this.formSchema.passengersFields.passengerThreeSeatingLocation;
    public readonly threeEjection: FieldDefinition<OptionFieldModel> = this.formSchema.passengersFields.passengerThreeEjection;
    public readonly threeMedicalFacilityTransport: FieldDefinition<OptionFieldModel> = this.formSchema.passengersFields.passengerThreeMedicalFacilityTransport;
    public readonly threeAirBagDeployment: FieldDefinition<OptionFieldModel> = this.formSchema.passengersFields.passengerThreeAirBagDeployment;
    public readonly threeSafetyEquipment: FieldDefinition<OptionFieldModel> = this.formSchema.passengersFields.passengerThreeSafetyEquipment;
    public readonly threeRestraintDevice: FieldDefinition<OptionFieldModel> = this.formSchema.passengersFields.passengerThreeRestraintDevice;
    public readonly threeHeadInjury: FieldDefinition<OptionFieldModel> = this.formSchema.passengersFields.passengerThreeHeadInjury;
    public readonly fourPersonNumber: FieldDefinition<StringFieldModel> = this.formSchema.passengersFields.passengerFourPersonNumber;
    public readonly fourUnitNumber: FieldDefinition<StringFieldModel> = this.formSchema.passengersFields.passengerFourUnitNumber;
    public readonly fourNameAndAddress: FieldDefinition<StringFieldModel> = this.formSchema.passengersFields.passengerFourNameAndAddress;
    public readonly fourDateOfBirth: FieldDefinition<StringFieldModel> = this.formSchema.passengersFields.passengerFourDateOfBirth;
    public readonly fourInjuryStatus: FieldDefinition<OptionFieldModel> = this.formSchema.passengersFields.passengerFourInjuryStatus;
    public readonly fourSex: FieldDefinition<OptionFieldModel> = this.formSchema.passengersFields.passengerFourSex;
    public readonly fourRace: FieldDefinition<StringFieldModel> = this.formSchema.passengersFields.passengerFourRace;
    public readonly fourSeatingLocation: FieldDefinition<StringFieldModel> = this.formSchema.passengersFields.passengerFourSeatingLocation;
    public readonly fourEjection: FieldDefinition<OptionFieldModel> = this.formSchema.passengersFields.passengerFourEjection;
    public readonly fourMedicalFacilityTransport: FieldDefinition<OptionFieldModel> = this.formSchema.passengersFields.passengerFourMedicalFacilityTransport;
    public readonly fourAirBagDeployment: FieldDefinition<OptionFieldModel> = this.formSchema.passengersFields.passengerFourAirBagDeployment;
    public readonly fourSafetyEquipment: FieldDefinition<OptionFieldModel> = this.formSchema.passengersFields.passengerFourSafetyEquipment;
    public readonly fourRestraintDevice: FieldDefinition<OptionFieldModel> = this.formSchema.passengersFields.passengerFourRestraintDevice;
    public readonly fourHeadInjury: FieldDefinition<OptionFieldModel> = this.formSchema.passengersFields.passengerFourHeadInjury;

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

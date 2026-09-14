import { ISection, FieldDefinition, NumberFieldModel, OptionFieldModel, SectionModel, StringFieldModel } from "@forms/core";
import { GAUTCFormSchema } from "../utc-form-schema";

export interface IViolatorSection extends ISection {
}

export interface IViolatorSectionModel extends IViolatorSection {
}

/**
 * Represents the model for Section I (Violator) of the Georgia uniform traffic citation.
 *
 * The paper prints the violator's race and sex as one slashed box; they are held as two fields here, because a
 * record carrying one and not the other has nowhere to go in a single box. Race, hair and eye colour are free text
 * - each takes a write-in code on paper and Atlanta publishes no code set for them.
 */
export class ViolatorSectionModel extends SectionModel implements IViolatorSectionModel {
    private formSchema: GAUTCFormSchema = this.getSchema<GAUTCFormSchema>();

    public readonly licenseClass: FieldDefinition<StringFieldModel> = this.formSchema.violatorFields.violatorLicenseClass;
    public readonly licenseState: FieldDefinition<OptionFieldModel> = this.formSchema.violatorFields.violatorLicenseState;
    public readonly licenseEndorsements: FieldDefinition<StringFieldModel> = this.formSchema.violatorFields.violatorLicenseEndorsements;
    public readonly licenseExpires: FieldDefinition<StringFieldModel> = this.formSchema.violatorFields.violatorLicenseExpires;
    public readonly operatorLicenseNumber: FieldDefinition<StringFieldModel> = this.formSchema.violatorFields.violatorOperatorLicenseNumber;
    public readonly lastName: FieldDefinition<StringFieldModel> = this.formSchema.violatorFields.violatorLastName;
    public readonly suffix: FieldDefinition<StringFieldModel> = this.formSchema.violatorFields.violatorSuffix;
    public readonly firstName: FieldDefinition<StringFieldModel> = this.formSchema.violatorFields.violatorFirstName;
    public readonly middleName: FieldDefinition<StringFieldModel> = this.formSchema.violatorFields.violatorMiddleName;
    public readonly race: FieldDefinition<StringFieldModel> = this.formSchema.violatorFields.violatorRace;
    public readonly sex: FieldDefinition<OptionFieldModel> = this.formSchema.violatorFields.violatorSex;
    public readonly address: FieldDefinition<StringFieldModel> = this.formSchema.violatorFields.violatorAddress;
    public readonly apartment: FieldDefinition<StringFieldModel> = this.formSchema.violatorFields.violatorApartment;
    public readonly city: FieldDefinition<StringFieldModel> = this.formSchema.violatorFields.violatorCity;
    public readonly state: FieldDefinition<OptionFieldModel> = this.formSchema.violatorFields.violatorState;
    public readonly zipCode: FieldDefinition<StringFieldModel> = this.formSchema.violatorFields.violatorZipCode;
    public readonly phone: FieldDefinition<StringFieldModel> = this.formSchema.violatorFields.violatorPhone;
    public readonly dateOfBirth: FieldDefinition<StringFieldModel> = this.formSchema.violatorFields.violatorDateOfBirth;
    public readonly hair: FieldDefinition<StringFieldModel> = this.formSchema.violatorFields.violatorHair;
    public readonly height: FieldDefinition<StringFieldModel> = this.formSchema.violatorFields.violatorHeight;
    public readonly weight: FieldDefinition<NumberFieldModel> = this.formSchema.violatorFields.violatorWeight;
    public readonly eye: FieldDefinition<StringFieldModel> = this.formSchema.violatorFields.violatorEye;

    public getAddress(): StringFieldModel { return this.get<StringFieldModel>(this.address); }
    public getApartment(): StringFieldModel { return this.get<StringFieldModel>(this.apartment); }
    public getCity(): StringFieldModel { return this.get<StringFieldModel>(this.city); }
    public getDateOfBirth(): StringFieldModel { return this.get<StringFieldModel>(this.dateOfBirth); }
    public getEye(): StringFieldModel { return this.get<StringFieldModel>(this.eye); }
    public getFirstName(): StringFieldModel { return this.get<StringFieldModel>(this.firstName); }
    public getHair(): StringFieldModel { return this.get<StringFieldModel>(this.hair); }
    public getHeight(): StringFieldModel { return this.get<StringFieldModel>(this.height); }
    public getLastName(): StringFieldModel { return this.get<StringFieldModel>(this.lastName); }
    public getLicenseClass(): StringFieldModel { return this.get<StringFieldModel>(this.licenseClass); }
    public getLicenseEndorsements(): StringFieldModel { return this.get<StringFieldModel>(this.licenseEndorsements); }
    public getLicenseExpires(): StringFieldModel { return this.get<StringFieldModel>(this.licenseExpires); }
    public getLicenseState(): OptionFieldModel { return this.get<OptionFieldModel>(this.licenseState); }
    public getMiddleName(): StringFieldModel { return this.get<StringFieldModel>(this.middleName); }
    public getOperatorLicenseNumber(): StringFieldModel { return this.get<StringFieldModel>(this.operatorLicenseNumber); }
    public getPhone(): StringFieldModel { return this.get<StringFieldModel>(this.phone); }
    public getRace(): StringFieldModel { return this.get<StringFieldModel>(this.race); }
    public getSex(): OptionFieldModel { return this.get<OptionFieldModel>(this.sex); }
    public getState(): OptionFieldModel { return this.get<OptionFieldModel>(this.state); }
    public getSuffix(): StringFieldModel { return this.get<StringFieldModel>(this.suffix); }
    public getWeight(): NumberFieldModel { return this.get<NumberFieldModel>(this.weight); }
    public getZipCode(): StringFieldModel { return this.get<StringFieldModel>(this.zipCode); }
}

import { ISection, FieldDefinition, OptionFieldModel, SectionModel, StringFieldModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface IWitnessSection extends ISection {
}

export interface IWitnessSectionModel extends IWitnessSection {
}

/** Represents the model for the three witness or property owner rows the collision page carries. The form prints a fixed three rows, so they are three numbered groups of fields rather than a collection. */
export class WitnessSectionModel extends SectionModel implements IWitnessSectionModel {
    private formSchema: TR310FormSchema = this.getSchema<TR310FormSchema>();

    public readonly oneType: FieldDefinition<StringFieldModel> = this.formSchema.witnessFields.witnessOneType;
    public readonly oneFirstName: FieldDefinition<StringFieldModel> = this.formSchema.witnessFields.witnessOneFirstName;
    public readonly oneMiddleInitial: FieldDefinition<StringFieldModel> = this.formSchema.witnessFields.witnessOneMiddleInitial;
    public readonly oneLastName: FieldDefinition<StringFieldModel> = this.formSchema.witnessFields.witnessOneLastName;
    public readonly oneAddress: FieldDefinition<StringFieldModel> = this.formSchema.witnessFields.witnessOneAddress;
    public readonly oneCity: FieldDefinition<StringFieldModel> = this.formSchema.witnessFields.witnessOneCity;
    public readonly oneState: FieldDefinition<OptionFieldModel> = this.formSchema.witnessFields.witnessOneState;
    public readonly oneZipCode: FieldDefinition<StringFieldModel> = this.formSchema.witnessFields.witnessOneZipCode;
    public readonly oneTelephone: FieldDefinition<StringFieldModel> = this.formSchema.witnessFields.witnessOneTelephone;
    public readonly onePropertyDamageAmount: FieldDefinition<StringFieldModel> = this.formSchema.witnessFields.witnessOnePropertyDamageAmount;
    public readonly onePropertyDamageDescription: FieldDefinition<StringFieldModel> = this.formSchema.witnessFields.witnessOnePropertyDamageDescription;
    public readonly twoType: FieldDefinition<StringFieldModel> = this.formSchema.witnessFields.witnessTwoType;
    public readonly twoFirstName: FieldDefinition<StringFieldModel> = this.formSchema.witnessFields.witnessTwoFirstName;
    public readonly twoMiddleInitial: FieldDefinition<StringFieldModel> = this.formSchema.witnessFields.witnessTwoMiddleInitial;
    public readonly twoLastName: FieldDefinition<StringFieldModel> = this.formSchema.witnessFields.witnessTwoLastName;
    public readonly twoAddress: FieldDefinition<StringFieldModel> = this.formSchema.witnessFields.witnessTwoAddress;
    public readonly twoCity: FieldDefinition<StringFieldModel> = this.formSchema.witnessFields.witnessTwoCity;
    public readonly twoState: FieldDefinition<OptionFieldModel> = this.formSchema.witnessFields.witnessTwoState;
    public readonly twoZipCode: FieldDefinition<StringFieldModel> = this.formSchema.witnessFields.witnessTwoZipCode;
    public readonly twoTelephone: FieldDefinition<StringFieldModel> = this.formSchema.witnessFields.witnessTwoTelephone;
    public readonly twoPropertyDamageAmount: FieldDefinition<StringFieldModel> = this.formSchema.witnessFields.witnessTwoPropertyDamageAmount;
    public readonly twoPropertyDamageDescription: FieldDefinition<StringFieldModel> = this.formSchema.witnessFields.witnessTwoPropertyDamageDescription;
    public readonly threeType: FieldDefinition<StringFieldModel> = this.formSchema.witnessFields.witnessThreeType;
    public readonly threeFirstName: FieldDefinition<StringFieldModel> = this.formSchema.witnessFields.witnessThreeFirstName;
    public readonly threeMiddleInitial: FieldDefinition<StringFieldModel> = this.formSchema.witnessFields.witnessThreeMiddleInitial;
    public readonly threeLastName: FieldDefinition<StringFieldModel> = this.formSchema.witnessFields.witnessThreeLastName;
    public readonly threeAddress: FieldDefinition<StringFieldModel> = this.formSchema.witnessFields.witnessThreeAddress;
    public readonly threeCity: FieldDefinition<StringFieldModel> = this.formSchema.witnessFields.witnessThreeCity;
    public readonly threeState: FieldDefinition<OptionFieldModel> = this.formSchema.witnessFields.witnessThreeState;
    public readonly threeZipCode: FieldDefinition<StringFieldModel> = this.formSchema.witnessFields.witnessThreeZipCode;
    public readonly threeTelephone: FieldDefinition<StringFieldModel> = this.formSchema.witnessFields.witnessThreeTelephone;
    public readonly threePropertyDamageAmount: FieldDefinition<StringFieldModel> = this.formSchema.witnessFields.witnessThreePropertyDamageAmount;
    public readonly threePropertyDamageDescription: FieldDefinition<StringFieldModel> = this.formSchema.witnessFields.witnessThreePropertyDamageDescription;

    public getOneType(): StringFieldModel { return this.get<StringFieldModel>(this.oneType); }
    public getOneFirstName(): StringFieldModel { return this.get<StringFieldModel>(this.oneFirstName); }
    public getOneMiddleInitial(): StringFieldModel { return this.get<StringFieldModel>(this.oneMiddleInitial); }
    public getOneLastName(): StringFieldModel { return this.get<StringFieldModel>(this.oneLastName); }
    public getOneAddress(): StringFieldModel { return this.get<StringFieldModel>(this.oneAddress); }
    public getOneCity(): StringFieldModel { return this.get<StringFieldModel>(this.oneCity); }
    public getOneState(): OptionFieldModel { return this.get<OptionFieldModel>(this.oneState); }
    public getOneZipCode(): StringFieldModel { return this.get<StringFieldModel>(this.oneZipCode); }
    public getOneTelephone(): StringFieldModel { return this.get<StringFieldModel>(this.oneTelephone); }
    public getOnePropertyDamageAmount(): StringFieldModel { return this.get<StringFieldModel>(this.onePropertyDamageAmount); }
    public getOnePropertyDamageDescription(): StringFieldModel { return this.get<StringFieldModel>(this.onePropertyDamageDescription); }
    public getTwoType(): StringFieldModel { return this.get<StringFieldModel>(this.twoType); }
    public getTwoFirstName(): StringFieldModel { return this.get<StringFieldModel>(this.twoFirstName); }
    public getTwoMiddleInitial(): StringFieldModel { return this.get<StringFieldModel>(this.twoMiddleInitial); }
    public getTwoLastName(): StringFieldModel { return this.get<StringFieldModel>(this.twoLastName); }
    public getTwoAddress(): StringFieldModel { return this.get<StringFieldModel>(this.twoAddress); }
    public getTwoCity(): StringFieldModel { return this.get<StringFieldModel>(this.twoCity); }
    public getTwoState(): OptionFieldModel { return this.get<OptionFieldModel>(this.twoState); }
    public getTwoZipCode(): StringFieldModel { return this.get<StringFieldModel>(this.twoZipCode); }
    public getTwoTelephone(): StringFieldModel { return this.get<StringFieldModel>(this.twoTelephone); }
    public getTwoPropertyDamageAmount(): StringFieldModel { return this.get<StringFieldModel>(this.twoPropertyDamageAmount); }
    public getTwoPropertyDamageDescription(): StringFieldModel { return this.get<StringFieldModel>(this.twoPropertyDamageDescription); }
    public getThreeType(): StringFieldModel { return this.get<StringFieldModel>(this.threeType); }
    public getThreeFirstName(): StringFieldModel { return this.get<StringFieldModel>(this.threeFirstName); }
    public getThreeMiddleInitial(): StringFieldModel { return this.get<StringFieldModel>(this.threeMiddleInitial); }
    public getThreeLastName(): StringFieldModel { return this.get<StringFieldModel>(this.threeLastName); }
    public getThreeAddress(): StringFieldModel { return this.get<StringFieldModel>(this.threeAddress); }
    public getThreeCity(): StringFieldModel { return this.get<StringFieldModel>(this.threeCity); }
    public getThreeState(): OptionFieldModel { return this.get<OptionFieldModel>(this.threeState); }
    public getThreeZipCode(): StringFieldModel { return this.get<StringFieldModel>(this.threeZipCode); }
    public getThreeTelephone(): StringFieldModel { return this.get<StringFieldModel>(this.threeTelephone); }
    public getThreePropertyDamageAmount(): StringFieldModel { return this.get<StringFieldModel>(this.threePropertyDamageAmount); }
    public getThreePropertyDamageDescription(): StringFieldModel { return this.get<StringFieldModel>(this.threePropertyDamageDescription); }
}

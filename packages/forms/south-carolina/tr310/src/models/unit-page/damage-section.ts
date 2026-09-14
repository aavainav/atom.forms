import { ISection, FieldDefinition, OptionFieldModel, SectionModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface IDamageSection extends ISection {
}

export interface IDamageSectionModel extends IDamageSection {
}

/** Represents the model for where the unit was damaged: the initial point of contact and the twelve other areas the form prints boxes for, all drawn from the same list of clock positions and named areas. */
export class DamageSectionModel extends SectionModel implements IDamageSectionModel {
    private formSchema: TR310FormSchema = this.getSchema<TR310FormSchema>();

    public readonly initialPointOfContact: FieldDefinition<OptionFieldModel> = this.formSchema.damageFields.damageInitialPointOfContact;
    public readonly areaOne: FieldDefinition<OptionFieldModel> = this.formSchema.damageFields.damageAreaOne;
    public readonly areaTwo: FieldDefinition<OptionFieldModel> = this.formSchema.damageFields.damageAreaTwo;
    public readonly areaThree: FieldDefinition<OptionFieldModel> = this.formSchema.damageFields.damageAreaThree;
    public readonly areaFour: FieldDefinition<OptionFieldModel> = this.formSchema.damageFields.damageAreaFour;
    public readonly areaFive: FieldDefinition<OptionFieldModel> = this.formSchema.damageFields.damageAreaFive;
    public readonly areaSix: FieldDefinition<OptionFieldModel> = this.formSchema.damageFields.damageAreaSix;
    public readonly areaSeven: FieldDefinition<OptionFieldModel> = this.formSchema.damageFields.damageAreaSeven;
    public readonly areaEight: FieldDefinition<OptionFieldModel> = this.formSchema.damageFields.damageAreaEight;
    public readonly areaNine: FieldDefinition<OptionFieldModel> = this.formSchema.damageFields.damageAreaNine;
    public readonly areaTen: FieldDefinition<OptionFieldModel> = this.formSchema.damageFields.damageAreaTen;
    public readonly areaEleven: FieldDefinition<OptionFieldModel> = this.formSchema.damageFields.damageAreaEleven;
    public readonly areaTwelve: FieldDefinition<OptionFieldModel> = this.formSchema.damageFields.damageAreaTwelve;

    public getInitialPointOfContact(): OptionFieldModel { return this.get<OptionFieldModel>(this.initialPointOfContact); }
    public getAreaOne(): OptionFieldModel { return this.get<OptionFieldModel>(this.areaOne); }
    public getAreaTwo(): OptionFieldModel { return this.get<OptionFieldModel>(this.areaTwo); }
    public getAreaThree(): OptionFieldModel { return this.get<OptionFieldModel>(this.areaThree); }
    public getAreaFour(): OptionFieldModel { return this.get<OptionFieldModel>(this.areaFour); }
    public getAreaFive(): OptionFieldModel { return this.get<OptionFieldModel>(this.areaFive); }
    public getAreaSix(): OptionFieldModel { return this.get<OptionFieldModel>(this.areaSix); }
    public getAreaSeven(): OptionFieldModel { return this.get<OptionFieldModel>(this.areaSeven); }
    public getAreaEight(): OptionFieldModel { return this.get<OptionFieldModel>(this.areaEight); }
    public getAreaNine(): OptionFieldModel { return this.get<OptionFieldModel>(this.areaNine); }
    public getAreaTen(): OptionFieldModel { return this.get<OptionFieldModel>(this.areaTen); }
    public getAreaEleven(): OptionFieldModel { return this.get<OptionFieldModel>(this.areaEleven); }
    public getAreaTwelve(): OptionFieldModel { return this.get<OptionFieldModel>(this.areaTwelve); }
}

import { ISection, FieldDefinition, FormModel, OptionFieldModel, SectionModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface IDamageSection extends ISection {
}

export interface IDamageSectionModel extends IDamageSection {
}

/** Represents the model for where the unit was damaged: the initial point of contact and the twelve other areas the form prints boxes for, all drawn from the same list of clock positions and named areas. */
export class DamageSectionModel extends SectionModel implements IDamageSectionModel {
    private schema: TR310FormSchema = FormModel.getSchema<TR310FormSchema>(TR310FormSchema);

    public readonly initialPointOfContact: FieldDefinition<OptionFieldModel> = this.schema.damageFields.damageInitialPointOfContact;
    public readonly areaOne: FieldDefinition<OptionFieldModel> = this.schema.damageFields.damageAreaOne;
    public readonly areaTwo: FieldDefinition<OptionFieldModel> = this.schema.damageFields.damageAreaTwo;
    public readonly areaThree: FieldDefinition<OptionFieldModel> = this.schema.damageFields.damageAreaThree;
    public readonly areaFour: FieldDefinition<OptionFieldModel> = this.schema.damageFields.damageAreaFour;
    public readonly areaFive: FieldDefinition<OptionFieldModel> = this.schema.damageFields.damageAreaFive;
    public readonly areaSix: FieldDefinition<OptionFieldModel> = this.schema.damageFields.damageAreaSix;
    public readonly areaSeven: FieldDefinition<OptionFieldModel> = this.schema.damageFields.damageAreaSeven;
    public readonly areaEight: FieldDefinition<OptionFieldModel> = this.schema.damageFields.damageAreaEight;
    public readonly areaNine: FieldDefinition<OptionFieldModel> = this.schema.damageFields.damageAreaNine;
    public readonly areaTen: FieldDefinition<OptionFieldModel> = this.schema.damageFields.damageAreaTen;
    public readonly areaEleven: FieldDefinition<OptionFieldModel> = this.schema.damageFields.damageAreaEleven;
    public readonly areaTwelve: FieldDefinition<OptionFieldModel> = this.schema.damageFields.damageAreaTwelve;

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

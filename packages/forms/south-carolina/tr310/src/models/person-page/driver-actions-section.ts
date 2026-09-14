import { ISection, FieldDefinition, OptionFieldModel, SectionModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface IDriverActionsSection extends ISection {
}

export interface IDriverActionsSectionModel extends IDriverActionsSection {
}

/** Represents the model for what the driver was distracted by and the up to four actions they took at the time of the collision, in order. */
export class DriverActionsSectionModel extends SectionModel implements IDriverActionsSectionModel {
    private formSchema: TR310FormSchema = this.getSchema<TR310FormSchema>();

    public readonly distraction: FieldDefinition<OptionFieldModel> = this.formSchema.driverActionsFields.driverActionsDistraction;
    public readonly first: FieldDefinition<OptionFieldModel> = this.formSchema.driverActionsFields.driverActionsFirst;
    public readonly second: FieldDefinition<OptionFieldModel> = this.formSchema.driverActionsFields.driverActionsSecond;
    public readonly third: FieldDefinition<OptionFieldModel> = this.formSchema.driverActionsFields.driverActionsThird;
    public readonly fourth: FieldDefinition<OptionFieldModel> = this.formSchema.driverActionsFields.driverActionsFourth;

    public getDistraction(): OptionFieldModel { return this.get<OptionFieldModel>(this.distraction); }
    public getFirst(): OptionFieldModel { return this.get<OptionFieldModel>(this.first); }
    public getSecond(): OptionFieldModel { return this.get<OptionFieldModel>(this.second); }
    public getThird(): OptionFieldModel { return this.get<OptionFieldModel>(this.third); }
    public getFourth(): OptionFieldModel { return this.get<OptionFieldModel>(this.fourth); }
}

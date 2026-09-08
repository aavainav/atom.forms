import { ISection, FieldDefinition, FormModel, OptionFieldModel, SectionModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface IDriverActionsSection extends ISection {
}

export interface IDriverActionsSectionModel extends IDriverActionsSection {
}

/** Represents the model for what the driver was distracted by and the up to four actions they took at the time of the collision, in order. */
export class DriverActionsSectionModel extends SectionModel implements IDriverActionsSectionModel {
    private schema: TR310FormSchema = FormModel.getSchema<TR310FormSchema>(TR310FormSchema);

    public readonly distraction: FieldDefinition<OptionFieldModel> = this.schema.driverActionsFields.driverActionsDistraction;
    public readonly first: FieldDefinition<OptionFieldModel> = this.schema.driverActionsFields.driverActionsFirst;
    public readonly second: FieldDefinition<OptionFieldModel> = this.schema.driverActionsFields.driverActionsSecond;
    public readonly third: FieldDefinition<OptionFieldModel> = this.schema.driverActionsFields.driverActionsThird;
    public readonly fourth: FieldDefinition<OptionFieldModel> = this.schema.driverActionsFields.driverActionsFourth;

    public getDistraction(): OptionFieldModel { return this.get<OptionFieldModel>(this.distraction); }
    public getFirst(): OptionFieldModel { return this.get<OptionFieldModel>(this.first); }
    public getSecond(): OptionFieldModel { return this.get<OptionFieldModel>(this.second); }
    public getThird(): OptionFieldModel { return this.get<OptionFieldModel>(this.third); }
    public getFourth(): OptionFieldModel { return this.get<OptionFieldModel>(this.fourth); }
}

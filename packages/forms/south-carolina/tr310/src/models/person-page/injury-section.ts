import { ISection, FieldDefinition, FormModel, OptionFieldModel, SectionModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface IInjurySection extends ISection {
}

export interface IInjurySectionModel extends IInjurySection {
}

/** Represents the model for how badly the person was hurt, what they contributed to the collision, and what they were doing before the impact. */
export class InjurySectionModel extends SectionModel implements IInjurySectionModel {
    private schema: TR310FormSchema = FormModel.getSchema<TR310FormSchema>(TR310FormSchema);

    public readonly status: FieldDefinition<OptionFieldModel> = this.schema.injuryFields.injuryStatus;
    public readonly contributingActionFirst: FieldDefinition<OptionFieldModel> = this.schema.injuryFields.injuryContributingActionFirst;
    public readonly contributingActionSecond: FieldDefinition<OptionFieldModel> = this.schema.injuryFields.injuryContributingActionSecond;
    public readonly actionPriorToImpact: FieldDefinition<OptionFieldModel> = this.schema.injuryFields.injuryActionPriorToImpact;

    public getStatus(): OptionFieldModel { return this.get<OptionFieldModel>(this.status); }
    public getContributingActionFirst(): OptionFieldModel { return this.get<OptionFieldModel>(this.contributingActionFirst); }
    public getContributingActionSecond(): OptionFieldModel { return this.get<OptionFieldModel>(this.contributingActionSecond); }
    public getActionPriorToImpact(): OptionFieldModel { return this.get<OptionFieldModel>(this.actionPriorToImpact); }
}

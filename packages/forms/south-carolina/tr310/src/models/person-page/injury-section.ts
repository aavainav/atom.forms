import { ISection, FieldDefinition, OptionFieldModel, SectionModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface IInjurySection extends ISection {
}

export interface IInjurySectionModel extends IInjurySection {
}

/** Represents the model for how badly the person was hurt, what they contributed to the collision, and what they were doing before the impact. */
export class InjurySectionModel extends SectionModel implements IInjurySectionModel {
    private formSchema: TR310FormSchema = this.getSchema<TR310FormSchema>();

    public readonly status: FieldDefinition<OptionFieldModel> = this.formSchema.injuryFields.injuryStatus;
    public readonly contributingActionFirst: FieldDefinition<OptionFieldModel> = this.formSchema.injuryFields.injuryContributingActionFirst;
    public readonly contributingActionSecond: FieldDefinition<OptionFieldModel> = this.formSchema.injuryFields.injuryContributingActionSecond;
    public readonly actionPriorToImpact: FieldDefinition<OptionFieldModel> = this.formSchema.injuryFields.injuryActionPriorToImpact;

    public getStatus(): OptionFieldModel { return this.get<OptionFieldModel>(this.status); }
    public getContributingActionFirst(): OptionFieldModel { return this.get<OptionFieldModel>(this.contributingActionFirst); }
    public getContributingActionSecond(): OptionFieldModel { return this.get<OptionFieldModel>(this.contributingActionSecond); }
    public getActionPriorToImpact(): OptionFieldModel { return this.get<OptionFieldModel>(this.actionPriorToImpact); }
}

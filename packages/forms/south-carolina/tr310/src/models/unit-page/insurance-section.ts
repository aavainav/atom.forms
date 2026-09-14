import { ISection, FieldDefinition, OptionFieldModel, SectionModel, StringFieldModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface IInsuranceSection extends ISection {
}

export interface IInsuranceSectionModel extends IInsuranceSection {
}

/** Represents the model for the unit's insurance, whether it was towed, and the estimated damage to it. */
export class InsuranceSectionModel extends SectionModel implements IInsuranceSectionModel {
    private formSchema: TR310FormSchema = this.getSchema<TR310FormSchema>();

    public readonly company: FieldDefinition<StringFieldModel> = this.formSchema.insuranceFields.insuranceCompany;
    public readonly cdlRequired: FieldDefinition<OptionFieldModel> = this.formSchema.insuranceFields.insuranceCdlRequired;
    public readonly towed: FieldDefinition<OptionFieldModel> = this.formSchema.insuranceFields.insuranceTowed;
    public readonly towedBy: FieldDefinition<StringFieldModel> = this.formSchema.insuranceFields.insuranceTowedBy;
    public readonly estimatedDamage: FieldDefinition<StringFieldModel> = this.formSchema.insuranceFields.insuranceEstimatedDamage;

    public getCompany(): StringFieldModel { return this.get<StringFieldModel>(this.company); }
    public getCdlRequired(): OptionFieldModel { return this.get<OptionFieldModel>(this.cdlRequired); }
    public getTowed(): OptionFieldModel { return this.get<OptionFieldModel>(this.towed); }
    public getTowedBy(): StringFieldModel { return this.get<StringFieldModel>(this.towedBy); }
    public getEstimatedDamage(): StringFieldModel { return this.get<StringFieldModel>(this.estimatedDamage); }
}

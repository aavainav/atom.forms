import { ISection, FieldDefinition, OptionFieldModel, SectionModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface IJunctionSection extends ISection {
}

export interface IJunctionSectionModel extends IJunctionSection {
}

/** Represents the model for the collision's relation to a junction, the roadway and environmental factors contributing to it, and whether a school bus was involved. */
export class JunctionSectionModel extends SectionModel implements IJunctionSectionModel {
    private formSchema: TR310FormSchema = this.getSchema<TR310FormSchema>();

    public readonly relation: FieldDefinition<OptionFieldModel> = this.formSchema.junctionFields.junctionRelation;
    public readonly contributingFactorFirst: FieldDefinition<OptionFieldModel> = this.formSchema.junctionFields.junctionContributingFactorFirst;
    public readonly contributingFactorSecond: FieldDefinition<OptionFieldModel> = this.formSchema.junctionFields.junctionContributingFactorSecond;
    public readonly schoolBusRelated: FieldDefinition<OptionFieldModel> = this.formSchema.junctionFields.junctionSchoolBusRelated;

    public getRelation(): OptionFieldModel { return this.get<OptionFieldModel>(this.relation); }
    public getContributingFactorFirst(): OptionFieldModel { return this.get<OptionFieldModel>(this.contributingFactorFirst); }
    public getContributingFactorSecond(): OptionFieldModel { return this.get<OptionFieldModel>(this.contributingFactorSecond); }
    public getSchoolBusRelated(): OptionFieldModel { return this.get<OptionFieldModel>(this.schoolBusRelated); }
}

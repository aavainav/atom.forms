import { FieldDefinition, FormModel, ISection, OptionFieldModel, SectionModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface IJunctionSection extends ISection {
}

export interface IJunctionSectionModel extends IJunctionSection {
}

/** Represents the model for the collision's relation to a junction, the roadway and environmental factors contributing to it, and whether a school bus was involved. */
export class JunctionSectionModel extends SectionModel implements IJunctionSectionModel {
    private schema: TR310FormSchema = FormModel.getSchema<TR310FormSchema>(JunctionSectionModel);

    public readonly relation: FieldDefinition<OptionFieldModel> = this.schema.junctionFields.junctionRelation;
    public readonly contributingFactorFirst: FieldDefinition<OptionFieldModel> = this.schema.junctionFields.junctionContributingFactorFirst;
    public readonly contributingFactorSecond: FieldDefinition<OptionFieldModel> = this.schema.junctionFields.junctionContributingFactorSecond;
    public readonly schoolBusRelated: FieldDefinition<OptionFieldModel> = this.schema.junctionFields.junctionSchoolBusRelated;

    public getRelation(): OptionFieldModel { return this.get<OptionFieldModel>(this.relation); }
    public getContributingFactorFirst(): OptionFieldModel { return this.get<OptionFieldModel>(this.contributingFactorFirst); }
    public getContributingFactorSecond(): OptionFieldModel { return this.get<OptionFieldModel>(this.contributingFactorSecond); }
    public getSchoolBusRelated(): OptionFieldModel { return this.get<OptionFieldModel>(this.schoolBusRelated); }
}

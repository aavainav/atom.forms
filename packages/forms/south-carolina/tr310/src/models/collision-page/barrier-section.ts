import { ISection, FieldDefinition, OptionFieldModel, SectionModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface IBarrierSection extends ISection {
}

export interface IBarrierSectionModel extends IBarrierSection {
}

/** Represents the model for the barrier present at the collision location and the type of intersection it occurred at. */
export class BarrierSectionModel extends SectionModel implements IBarrierSectionModel {
    private formSchema: TR310FormSchema = this.getSchema<TR310FormSchema>();

    public readonly type: FieldDefinition<OptionFieldModel> = this.formSchema.barrierFields.barrierType;
    public readonly intersectionType: FieldDefinition<OptionFieldModel> = this.formSchema.barrierFields.barrierIntersectionType;

    public getType(): OptionFieldModel { return this.get<OptionFieldModel>(this.type); }
    public getIntersectionType(): OptionFieldModel { return this.get<OptionFieldModel>(this.intersectionType); }
}

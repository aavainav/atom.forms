import { FieldDefinition, FormModel, ISection, OptionFieldModel, SectionModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface IBarrierSection extends ISection {
}

export interface IBarrierSectionModel extends IBarrierSection {
}

/** Represents the model for the barrier present at the collision location and the type of intersection it occurred at. */
export class BarrierSectionModel extends SectionModel implements IBarrierSectionModel {
    private schema: TR310FormSchema = FormModel.getSchema<TR310FormSchema>(BarrierSectionModel);

    public readonly type: FieldDefinition<OptionFieldModel> = this.schema.barrierFields.barrierType;
    public readonly intersectionType: FieldDefinition<OptionFieldModel> = this.schema.barrierFields.barrierIntersectionType;

    public getType(): OptionFieldModel { return this.get<OptionFieldModel>(this.type); }
    public getIntersectionType(): OptionFieldModel { return this.get<OptionFieldModel>(this.intersectionType); }
}

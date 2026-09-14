import { ISection, FieldDefinition, OptionFieldModel, SectionModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface ISafetyEquipmentSection extends ISection {
}

export interface ISafetyEquipmentSectionModel extends ISafetyEquipmentSection {
}

/** Represents the model for the safety equipment the person was using, every box of which takes the same yes/no/unknown/not-applicable answer. */
export class SafetyEquipmentSectionModel extends SectionModel implements ISafetyEquipmentSectionModel {
    private formSchema: TR310FormSchema = this.getSchema<TR310FormSchema>();

    public readonly helmetUse: FieldDefinition<OptionFieldModel> = this.formSchema.safetyEquipmentFields.safetyEquipmentHelmetUse;
    public readonly protectivePadsUse: FieldDefinition<OptionFieldModel> = this.formSchema.safetyEquipmentFields.safetyEquipmentProtectivePadsUse;
    public readonly otherProtectiveUse: FieldDefinition<OptionFieldModel> = this.formSchema.safetyEquipmentFields.safetyEquipmentOtherProtectiveUse;
    public readonly reflectiveClothingUse: FieldDefinition<OptionFieldModel> = this.formSchema.safetyEquipmentFields.safetyEquipmentReflectiveClothingUse;
    public readonly lightingUse: FieldDefinition<OptionFieldModel> = this.formSchema.safetyEquipmentFields.safetyEquipmentLightingUse;
    public readonly otherPreventativeUse: FieldDefinition<OptionFieldModel> = this.formSchema.safetyEquipmentFields.safetyEquipmentOtherPreventativeUse;

    public getHelmetUse(): OptionFieldModel { return this.get<OptionFieldModel>(this.helmetUse); }
    public getProtectivePadsUse(): OptionFieldModel { return this.get<OptionFieldModel>(this.protectivePadsUse); }
    public getOtherProtectiveUse(): OptionFieldModel { return this.get<OptionFieldModel>(this.otherProtectiveUse); }
    public getReflectiveClothingUse(): OptionFieldModel { return this.get<OptionFieldModel>(this.reflectiveClothingUse); }
    public getLightingUse(): OptionFieldModel { return this.get<OptionFieldModel>(this.lightingUse); }
    public getOtherPreventativeUse(): OptionFieldModel { return this.get<OptionFieldModel>(this.otherPreventativeUse); }
}

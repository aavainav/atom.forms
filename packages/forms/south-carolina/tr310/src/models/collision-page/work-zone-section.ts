import { ISection, FieldDefinition, FormModel, OptionFieldModel, SectionModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface IWorkZoneSection extends ISection {
}

export interface IWorkZoneSectionModel extends IWorkZoneSection {
}

/** Represents the model for the work zone the collision occurred in, if it occurred in one; the detail fields only mean anything once the collision is recorded as work zone related. */
export class WorkZoneSectionModel extends SectionModel implements IWorkZoneSectionModel {
    private schema: TR310FormSchema = FormModel.getSchema<TR310FormSchema>(TR310FormSchema);

    public readonly related: FieldDefinition<OptionFieldModel> = this.schema.workZoneFields.workZoneRelated;
    public readonly crashLocation: FieldDefinition<OptionFieldModel> = this.schema.workZoneFields.workZoneCrashLocation;
    public readonly type: FieldDefinition<OptionFieldModel> = this.schema.workZoneFields.workZoneType;
    public readonly workerPresent: FieldDefinition<OptionFieldModel> = this.schema.workZoneFields.workZoneWorkerPresent;
    public readonly lawEnforcement: FieldDefinition<OptionFieldModel> = this.schema.workZoneFields.workZoneLawEnforcement;

    public getRelated(): OptionFieldModel { return this.get<OptionFieldModel>(this.related); }
    public getCrashLocation(): OptionFieldModel { return this.get<OptionFieldModel>(this.crashLocation); }
    public getType(): OptionFieldModel { return this.get<OptionFieldModel>(this.type); }
    public getWorkerPresent(): OptionFieldModel { return this.get<OptionFieldModel>(this.workerPresent); }
    public getLawEnforcement(): OptionFieldModel { return this.get<OptionFieldModel>(this.lawEnforcement); }
}

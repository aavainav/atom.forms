import { ISection, FieldDefinition, OptionFieldModel, SectionModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface IWorkZoneSection extends ISection {
}

export interface IWorkZoneSectionModel extends IWorkZoneSection {
}

/** Represents the model for the work zone the collision occurred in, if it occurred in one; the detail fields only mean anything once the collision is recorded as work zone related. */
export class WorkZoneSectionModel extends SectionModel implements IWorkZoneSectionModel {
    private formSchema: TR310FormSchema = this.getSchema<TR310FormSchema>();

    public readonly related: FieldDefinition<OptionFieldModel> = this.formSchema.workZoneFields.workZoneRelated;
    public readonly crashLocation: FieldDefinition<OptionFieldModel> = this.formSchema.workZoneFields.workZoneCrashLocation;
    public readonly type: FieldDefinition<OptionFieldModel> = this.formSchema.workZoneFields.workZoneType;
    public readonly workerPresent: FieldDefinition<OptionFieldModel> = this.formSchema.workZoneFields.workZoneWorkerPresent;
    public readonly lawEnforcement: FieldDefinition<OptionFieldModel> = this.formSchema.workZoneFields.workZoneLawEnforcement;

    public getRelated(): OptionFieldModel { return this.get<OptionFieldModel>(this.related); }
    public getCrashLocation(): OptionFieldModel { return this.get<OptionFieldModel>(this.crashLocation); }
    public getType(): OptionFieldModel { return this.get<OptionFieldModel>(this.type); }
    public getWorkerPresent(): OptionFieldModel { return this.get<OptionFieldModel>(this.workerPresent); }
    public getLawEnforcement(): OptionFieldModel { return this.get<OptionFieldModel>(this.lawEnforcement); }
}

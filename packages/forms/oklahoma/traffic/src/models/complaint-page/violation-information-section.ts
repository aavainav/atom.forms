import { FieldDefinition, FormModel, ISection, NumberFieldModel, OptionFieldModel, SectionModel, StringFieldModel } from "@forms/core";
import { OKTrafficFormSchema } from "../traffic-form-schema";

export interface IViolationInformationSection extends ISection {
}

export interface IViolationInformationSectionModel extends IViolationInformationSection {
}

/** Model for the violation information section of the complaint page. Offense level and speed detection method are free text, not option fields, since Oklahoma City's code sets for them aren't published. */
export class ViolationInformationSectionModel extends SectionModel implements IViolationInformationSectionModel {
    private schema: OKTrafficFormSchema = FormModel.getSchema<OKTrafficFormSchema>(ViolationInformationSectionModel);

    public readonly incidentNumber: FieldDefinition<StringFieldModel> = this.schema.violationInformationFields.violationInformationIncidentNumber;
    public readonly offenseLevel: FieldDefinition<StringFieldModel> = this.schema.violationInformationFields.violationInformationOffenseLevel;
    public readonly highFatalitySpeed: FieldDefinition<OptionFieldModel> = this.schema.violationInformationFields.violationInformationHighFatalitySpeed;
    public readonly actualSpeed: FieldDefinition<NumberFieldModel> = this.schema.violationInformationFields.violationInformationActualSpeed;
    public readonly speedLimit: FieldDefinition<NumberFieldModel> = this.schema.violationInformationFields.violationInformationSpeedLimit;
    public readonly speedDetection: FieldDefinition<StringFieldModel> = this.schema.violationInformationFields.violationInformationSpeedDetection;
    public readonly lidarDistance: FieldDefinition<StringFieldModel> = this.schema.violationInformationFields.violationInformationLidarDistance;

    public getActualSpeed(): NumberFieldModel { return this.get<NumberFieldModel>(this.actualSpeed); }
    public getHighFatalitySpeed(): OptionFieldModel { return this.get<OptionFieldModel>(this.highFatalitySpeed); }
    public getIncidentNumber(): StringFieldModel { return this.get<StringFieldModel>(this.incidentNumber); }
    public getLidarDistance(): StringFieldModel { return this.get<StringFieldModel>(this.lidarDistance); }
    public getOffenseLevel(): StringFieldModel { return this.get<StringFieldModel>(this.offenseLevel); }
    public getSpeedDetection(): StringFieldModel { return this.get<StringFieldModel>(this.speedDetection); }
    public getSpeedLimit(): NumberFieldModel { return this.get<NumberFieldModel>(this.speedLimit); }
}

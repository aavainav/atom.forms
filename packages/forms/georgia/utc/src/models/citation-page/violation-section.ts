import { ISection, BooleanFieldModel, FieldDefinition, NumberFieldModel, SectionModel, StringFieldModel } from "@forms/core";
import { GAUTCFormSchema } from "../utc-form-schema";
import { selectExclusive } from "../exclusive-group";

export interface IViolationSection extends ISection {
}

export interface IViolationSectionModel extends IViolationSection {
}

/**
 * Represents the model for the speeding boxes of Section II of the Georgia uniform traffic citation.
 *
 * VASCAR, laser and radar are one exclusive group and the patrol vehicle / other pair is another: a speed is
 * clocked one way, by one thing. The 2-lane road and driver-requested accuracy check boxes are separate flags and
 * are left independent, since the paper asks them as their own questions rather than as one row of answers.
 */
export class ViolationSectionModel extends SectionModel implements IViolationSectionModel {
    private formSchema: GAUTCFormSchema = this.getSchema<GAUTCFormSchema>();

    public readonly twoLaneRoad: FieldDefinition<BooleanFieldModel> = this.formSchema.violationFields.violationTwoLaneRoad;
    public readonly driverRequestedAccuracyCheck: FieldDefinition<BooleanFieldModel> = this.formSchema.violationFields.violationDriverRequestedAccuracyCheck;
    public readonly vascar: FieldDefinition<BooleanFieldModel> = this.formSchema.violationFields.violationVascar;
    public readonly laser: FieldDefinition<BooleanFieldModel> = this.formSchema.violationFields.violationLaser;
    public readonly radar: FieldDefinition<BooleanFieldModel> = this.formSchema.violationFields.violationRadar;
    public readonly clockedByPatrolVehicle: FieldDefinition<BooleanFieldModel> = this.formSchema.violationFields.violationClockedByPatrolVehicle;
    public readonly clockedByOther: FieldDefinition<BooleanFieldModel> = this.formSchema.violationFields.violationClockedByOther;
    public readonly serialNumber: FieldDefinition<StringFieldModel> = this.formSchema.violationFields.violationSerialNumber;
    public readonly calibrationCheck: FieldDefinition<StringFieldModel> = this.formSchema.violationFields.violationCalibrationCheck;
    public readonly clockedSpeed: FieldDefinition<NumberFieldModel> = this.formSchema.violationFields.violationClockedSpeed;
    public readonly speedZone: FieldDefinition<NumberFieldModel> = this.formSchema.violationFields.violationSpeedZone;

    /** The patrol vehicle / other pair naming what the speed was clocked from. */
    public readonly clockedBy: ReadonlyArray<FieldDefinition<BooleanFieldModel>> = [this.clockedByPatrolVehicle, this.clockedByOther];
    /** The VASCAR / laser / radar group naming the device the speed was measured with. */
    public readonly speedDetection: ReadonlyArray<FieldDefinition<BooleanFieldModel>> = [this.vascar, this.laser, this.radar];

    public getCalibrationCheck(): StringFieldModel { return this.get<StringFieldModel>(this.calibrationCheck); }
    public getClockedByOther(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.clockedByOther); }
    public getClockedByPatrolVehicle(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.clockedByPatrolVehicle); }
    public getClockedSpeed(): NumberFieldModel { return this.get<NumberFieldModel>(this.clockedSpeed); }
    public getDriverRequestedAccuracyCheck(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.driverRequestedAccuracyCheck); }
    public getLaser(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.laser); }
    public getRadar(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.radar); }
    public getSerialNumber(): StringFieldModel { return this.get<StringFieldModel>(this.serialNumber); }
    public getSpeedZone(): NumberFieldModel { return this.get<NumberFieldModel>(this.speedZone); }
    public getTwoLaneRoad(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.twoLaneRoad); }
    public getVascar(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.vascar); }

    /** Returns a section with the given half of the patrol vehicle / other pair checked and the other cleared. */
    public selectClockedBy(selected: FieldDefinition<BooleanFieldModel>): this {
        return selectExclusive(this, this.clockedBy, selected);
    }

    /** Returns a section with the given speed detection device checked and the rest of the group cleared. */
    public selectSpeedDetection(selected: FieldDefinition<BooleanFieldModel>): this {
        return selectExclusive(this, this.speedDetection, selected);
    }
}

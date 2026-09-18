import { ISection, BooleanFieldModel, FieldDefinition, FormModel, SectionModel, StringFieldModel } from "@forms/core";
import { PublicContactOrWarningFormSchema } from "../public-contact-or-warning-form-schema";

export interface IPrimaryReasonSection extends ISection {
}

export interface IPrimaryReasonSectionModel extends IPrimaryReasonSection {
}

/** Represents the model for the "Primary Reason for Contact" section (check only one) of the public contact/warning record. */
export class PrimaryReasonSectionModel extends SectionModel implements IPrimaryReasonSectionModel {
    private schema: PublicContactOrWarningFormSchema = FormModel.getSchema<PublicContactOrWarningFormSchema>(PrimaryReasonSectionModel);

    public readonly movingViolation: FieldDefinition<BooleanFieldModel> = this.schema.primaryReasonFields.primaryReasonMovingViolation;
    public readonly nonMovingViolation: FieldDefinition<BooleanFieldModel> = this.schema.primaryReasonFields.primaryReasonNonMovingViolation;
    public readonly motoristAssistance: FieldDefinition<BooleanFieldModel> = this.schema.primaryReasonFields.primaryReasonMotoristAssistance;
    public readonly bolo: FieldDefinition<BooleanFieldModel> = this.schema.primaryReasonFields.primaryReasonBolo;
    public readonly trafficCollision: FieldDefinition<BooleanFieldModel> = this.schema.primaryReasonFields.primaryReasonTrafficCollision;
    public readonly suspiciousActivity: FieldDefinition<BooleanFieldModel> = this.schema.primaryReasonFields.primaryReasonSuspiciousActivity;
    public readonly other: FieldDefinition<BooleanFieldModel> = this.schema.primaryReasonFields.primaryReasonOther;
    public readonly otherSpecify: FieldDefinition<StringFieldModel> = this.schema.primaryReasonFields.primaryReasonOtherSpecify;

    /** The mutually-exclusive boolean fields making up the "check only one" group (excludes the free-text field). */
    private readonly exclusiveFields: FieldDefinition<BooleanFieldModel>[] = [
        this.movingViolation,
        this.nonMovingViolation,
        this.motoristAssistance,
        this.bolo,
        this.trafficCollision,
        this.suspiciousActivity,
        this.other
    ];

    public getMovingViolation(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.movingViolation); }
    public getNonMovingViolation(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.nonMovingViolation); }
    public getMotoristAssistance(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.motoristAssistance); }
    public getBolo(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.bolo); }
    public getTrafficCollision(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.trafficCollision); }
    public getSuspiciousActivity(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.suspiciousActivity); }
    public getOther(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.other); }
    public getOtherSpecify(): StringFieldModel { return this.get<StringFieldModel>(this.otherSpecify); }

    /** Selects the given reason, unchecking every other reason in the group in the same update -- true radio behavior, since the framework has no radio/enum field type. */
    public selectReason(selected: FieldDefinition<BooleanFieldModel>): this {
        return this.exclusiveFields.reduce(
            (section, fieldDefinition) => section.set(fieldDefinition, section.get<BooleanFieldModel>(fieldDefinition).setValue(fieldDefinition === selected)),
            this as this
        );
    }
}

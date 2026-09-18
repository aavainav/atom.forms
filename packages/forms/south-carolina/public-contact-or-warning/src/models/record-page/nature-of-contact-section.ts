import { ISection, BooleanFieldModel, FieldDefinition, FormModel, SectionModel, StringFieldModel } from "@forms/core";
import { PublicContactOrWarningFormSchema } from "../public-contact-or-warning-form-schema";

export interface INatureOfContactSection extends ISection {
}

export interface INatureOfContactSectionModel extends INatureOfContactSection {
}

/** Represents the model for the "Nature of Contact" section (check only one) of the public contact/warning record. */
export class NatureOfContactSectionModel extends SectionModel implements INatureOfContactSectionModel {
    private schema: PublicContactOrWarningFormSchema = FormModel.getSchema<PublicContactOrWarningFormSchema>(NatureOfContactSectionModel);

    public readonly speeding: FieldDefinition<BooleanFieldModel> = this.schema.natureOfContactFields.natureSpeeding;
    public readonly contactOnly: FieldDefinition<BooleanFieldModel> = this.schema.natureOfContactFields.natureContactOnly;
    public readonly improperLaneUse: FieldDefinition<BooleanFieldModel> = this.schema.natureOfContactFields.natureImproperLaneUse;
    public readonly failureToDimLights: FieldDefinition<BooleanFieldModel> = this.schema.natureOfContactFields.natureFailureToDimLights;
    public readonly improperBacking: FieldDefinition<BooleanFieldModel> = this.schema.natureOfContactFields.natureImproperBacking;
    public readonly improperLights: FieldDefinition<BooleanFieldModel> = this.schema.natureOfContactFields.natureImproperLights;
    public readonly improperTurn: FieldDefinition<BooleanFieldModel> = this.schema.natureOfContactFields.natureImproperTurn;
    public readonly disregardingStopSign: FieldDefinition<BooleanFieldModel> = this.schema.natureOfContactFields.natureDisregardingStopSign;
    public readonly seatBeltViolation: FieldDefinition<BooleanFieldModel> = this.schema.natureOfContactFields.natureSeatBeltViolation;
    public readonly handsFreeViolation: FieldDefinition<BooleanFieldModel> = this.schema.natureOfContactFields.natureHandsFreeViolation;
    public readonly disregardingTrafficSignal: FieldDefinition<BooleanFieldModel> = this.schema.natureOfContactFields.natureDisregardingTrafficSignal;
    public readonly followingTooClose: FieldDefinition<BooleanFieldModel> = this.schema.natureOfContactFields.natureFollowingTooClose;
    public readonly changingLanesUnlawfully: FieldDefinition<BooleanFieldModel> = this.schema.natureOfContactFields.natureChangingLanesUnlawfully;
    public readonly noRightOfWay: FieldDefinition<BooleanFieldModel> = this.schema.natureOfContactFields.natureNoRightOfWay;
    public readonly defectiveEquipment: FieldDefinition<BooleanFieldModel> = this.schema.natureOfContactFields.natureDefectiveEquipment;
    public readonly improperPassing: FieldDefinition<BooleanFieldModel> = this.schema.natureOfContactFields.natureImproperPassing;
    public readonly driversLicenseViolation: FieldDefinition<BooleanFieldModel> = this.schema.natureOfContactFields.natureDriversLicenseViolation;
    public readonly vehicleLicenseViolation: FieldDefinition<BooleanFieldModel> = this.schema.natureOfContactFields.natureVehicleLicenseViolation;
    public readonly pedestrian: FieldDefinition<BooleanFieldModel> = this.schema.natureOfContactFields.naturePedestrian;
    public readonly immigrationStop: FieldDefinition<BooleanFieldModel> = this.schema.natureOfContactFields.natureImmigrationStop;
    public readonly other: FieldDefinition<BooleanFieldModel> = this.schema.natureOfContactFields.natureOther;
    public readonly otherSpecify: FieldDefinition<StringFieldModel> = this.schema.natureOfContactFields.natureOtherSpecify;

    /** The mutually-exclusive boolean fields making up the "check all that apply" group turned "check only one" (excludes the free-text field). */
    private readonly exclusiveFields: FieldDefinition<BooleanFieldModel>[] = [
        this.speeding,
        this.contactOnly,
        this.improperLaneUse,
        this.failureToDimLights,
        this.improperBacking,
        this.improperLights,
        this.improperTurn,
        this.disregardingStopSign,
        this.seatBeltViolation,
        this.handsFreeViolation,
        this.disregardingTrafficSignal,
        this.followingTooClose,
        this.changingLanesUnlawfully,
        this.noRightOfWay,
        this.defectiveEquipment,
        this.improperPassing,
        this.driversLicenseViolation,
        this.vehicleLicenseViolation,
        this.pedestrian,
        this.immigrationStop,
        this.other
    ];

    public getSpeeding(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.speeding); }
    public getContactOnly(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.contactOnly); }
    public getImproperLaneUse(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.improperLaneUse); }
    public getFailureToDimLights(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.failureToDimLights); }
    public getImproperBacking(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.improperBacking); }
    public getImproperLights(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.improperLights); }
    public getImproperTurn(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.improperTurn); }
    public getDisregardingStopSign(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.disregardingStopSign); }
    public getSeatBeltViolation(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.seatBeltViolation); }
    public getHandsFreeViolation(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.handsFreeViolation); }
    public getDisregardingTrafficSignal(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.disregardingTrafficSignal); }
    public getFollowingTooClose(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.followingTooClose); }
    public getChangingLanesUnlawfully(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.changingLanesUnlawfully); }
    public getNoRightOfWay(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.noRightOfWay); }
    public getDefectiveEquipment(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.defectiveEquipment); }
    public getImproperPassing(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.improperPassing); }
    public getDriversLicenseViolation(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.driversLicenseViolation); }
    public getVehicleLicenseViolation(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.vehicleLicenseViolation); }
    public getPedestrian(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.pedestrian); }
    public getImmigrationStop(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.immigrationStop); }
    public getOther(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.other); }
    public getOtherSpecify(): StringFieldModel { return this.get<StringFieldModel>(this.otherSpecify); }

    /** Selects the given nature of contact, unchecking every other option in the group in the same update -- true radio behavior, since the framework has no radio/enum field type. */
    public selectNature(selected: FieldDefinition<BooleanFieldModel>): this {
        return this.exclusiveFields.reduce(
            (section, fieldDefinition) => section.set(fieldDefinition, section.get<BooleanFieldModel>(fieldDefinition).setValue(fieldDefinition === selected)),
            this as this
        );
    }
}

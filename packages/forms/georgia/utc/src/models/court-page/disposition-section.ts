import { ISection, BooleanFieldModel, FieldDefinition, FormModel, SectionModel, StringFieldModel } from "@forms/core";
import { GAUTCFormSchema } from "../utc-form-schema";
import { selectExclusive } from "../exclusive-group";

export interface IDispositionSection extends ISection {
}

export interface IDispositionSectionModel extends IDispositionSection {
}

/**
 * Represents the model for the "Disposition and Sentence" block of the court's copy.
 *
 * Three exclusive groups: what the defendant pleaded, how the case was tried and what it was adjudged, and the
 * other action the court took instead. The three schools and the assessment beneath them are separate flags - a
 * sentence may carry more than one - and so are left independent.
 *
 * The numbers printed beside the plea and trial options - (3) Guilty, (1) Guilty, (2) Bond Forfeiture - are part of
 * the labels the paper prints and are kept in them.
 */
export class DispositionSectionModel extends SectionModel implements IDispositionSectionModel {
    private schema: GAUTCFormSchema = FormModel.getSchema<GAUTCFormSchema>(GAUTCFormSchema);

    public readonly pleadsGuilty: FieldDefinition<BooleanFieldModel> = this.schema.dispositionFields.dispositionPleadsGuilty;
    public readonly pleadsNotGuilty: FieldDefinition<BooleanFieldModel> = this.schema.dispositionFields.dispositionPleadsNotGuilty;
    public readonly pleadsNoloContendere: FieldDefinition<BooleanFieldModel> = this.schema.dispositionFields.dispositionPleadsNoloContendere;
    public readonly trialJury: FieldDefinition<BooleanFieldModel> = this.schema.dispositionFields.dispositionTrialJury;
    public readonly trialCourtAdjudicated: FieldDefinition<BooleanFieldModel> = this.schema.dispositionFields.dispositionTrialCourtAdjudicated;
    public readonly trialGuilty: FieldDefinition<BooleanFieldModel> = this.schema.dispositionFields.dispositionTrialGuilty;
    public readonly trialNotGuilty: FieldDefinition<BooleanFieldModel> = this.schema.dispositionFields.dispositionTrialNotGuilty;
    public readonly bondForfeiture: FieldDefinition<BooleanFieldModel> = this.schema.dispositionFields.dispositionBondForfeiture;
    public readonly nolleProssed: FieldDefinition<BooleanFieldModel> = this.schema.dispositionFields.dispositionNolleProssed;
    public readonly deadDocket: FieldDefinition<BooleanFieldModel> = this.schema.dispositionFields.dispositionDeadDocket;
    public readonly fineAmount: FieldDefinition<StringFieldModel> = this.schema.dispositionFields.dispositionFineAmount;
    public readonly daysInJail: FieldDefinition<StringFieldModel> = this.schema.dispositionFields.dispositionDaysInJail;
    public readonly alcoholDrugRiskReductionSchool: FieldDefinition<BooleanFieldModel> = this.schema.dispositionFields.dispositionAlcoholDrugRiskReductionSchool;
    public readonly alcoholDrugAssessment: FieldDefinition<BooleanFieldModel> = this.schema.dispositionFields.dispositionAlcoholDrugAssessment;
    public readonly defensiveDrivingSchool: FieldDefinition<BooleanFieldModel> = this.schema.dispositionFields.dispositionDefensiveDrivingSchool;

    /** The bond forfeiture / nolle prossed / dead docket group, naming the other action the court took. */
    public readonly otherAction: ReadonlyArray<FieldDefinition<BooleanFieldModel>> = [this.bondForfeiture, this.nolleProssed, this.deadDocket];
    /** The guilty / not guilty / nolo contendere group, naming what the defendant pleaded. */
    public readonly pleads: ReadonlyArray<FieldDefinition<BooleanFieldModel>> = [this.pleadsGuilty, this.pleadsNotGuilty, this.pleadsNoloContendere];
    /** The jury / court adjudicated / guilty / not guilty group, naming how the case was tried and adjudged. */
    public readonly trial: ReadonlyArray<FieldDefinition<BooleanFieldModel>> = [this.trialJury, this.trialCourtAdjudicated, this.trialGuilty, this.trialNotGuilty];

    public getAlcoholDrugAssessment(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.alcoholDrugAssessment); }
    public getAlcoholDrugRiskReductionSchool(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.alcoholDrugRiskReductionSchool); }
    public getBondForfeiture(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.bondForfeiture); }
    public getDaysInJail(): StringFieldModel { return this.get<StringFieldModel>(this.daysInJail); }
    public getDeadDocket(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.deadDocket); }
    public getDefensiveDrivingSchool(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.defensiveDrivingSchool); }
    public getFineAmount(): StringFieldModel { return this.get<StringFieldModel>(this.fineAmount); }
    public getNolleProssed(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.nolleProssed); }
    public getPleadsGuilty(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.pleadsGuilty); }
    public getPleadsNoloContendere(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.pleadsNoloContendere); }
    public getPleadsNotGuilty(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.pleadsNotGuilty); }
    public getTrialCourtAdjudicated(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.trialCourtAdjudicated); }
    public getTrialGuilty(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.trialGuilty); }
    public getTrialJury(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.trialJury); }
    public getTrialNotGuilty(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.trialNotGuilty); }

    /** Returns a section with the given other action checked and the rest of the group cleared. */
    public selectOtherAction(selected: FieldDefinition<BooleanFieldModel>): this {
        return selectExclusive(this, this.otherAction, selected);
    }

    /** Returns a section with the given plea checked and the rest of the group cleared. */
    public selectPleads(selected: FieldDefinition<BooleanFieldModel>): this {
        return selectExclusive(this, this.pleads, selected);
    }

    /** Returns a section with the given trial outcome checked and the rest of the group cleared. */
    public selectTrial(selected: FieldDefinition<BooleanFieldModel>): this {
        return selectExclusive(this, this.trial, selected);
    }
}

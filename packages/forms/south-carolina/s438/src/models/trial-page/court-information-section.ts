import { BooleanFieldModel, FieldDefinition, FormModel, ISection, NumberFieldModel, SectionModel, StringFieldModel } from "@forms/core";
import { S438FormSchema } from "../s438-form-schema";

export interface ITrialCourtInformationSection extends ISection {
}

export interface ITrialCourtInformationSectionModel extends ITrialCourtInformationSection {
}

/** Represents the model for the court information section of the s438 form's trial page: the court the case went before, the trial, its disposition and the sentence. */
export class TrialCourtInformationSectionModel extends SectionModel implements ITrialCourtInformationSectionModel {
    private schema: S438FormSchema = FormModel.getSchema<S438FormSchema>(TrialCourtInformationSectionModel);

    public readonly caseBeforeMagistrate: FieldDefinition<BooleanFieldModel> = this.schema.trialCourtInformationFields.trialCourtInformationCaseBeforeMagistrate;
    public readonly caseBeforeMunicipalCourt: FieldDefinition<BooleanFieldModel> = this.schema.trialCourtInformationFields.trialCourtInformationCaseBeforeMunicipalCourt;
    public readonly caseBeforeCircuitCourt: FieldDefinition<BooleanFieldModel> = this.schema.trialCourtInformationFields.trialCourtInformationCaseBeforeCircuitCourt;
    public readonly caseBeforeFamilyCourt: FieldDefinition<BooleanFieldModel> = this.schema.trialCourtInformationFields.trialCourtInformationCaseBeforeFamilyCourt;
    public readonly caseBeforeFederalCourt: FieldDefinition<BooleanFieldModel> = this.schema.trialCourtInformationFields.trialCourtInformationCaseBeforeFederalCourt;
    public readonly courtIfDifferent: FieldDefinition<StringFieldModel> = this.schema.trialCourtInformationFields.trialCourtInformationCourtIfDifferent;
    public readonly trialByJudge: FieldDefinition<BooleanFieldModel> = this.schema.trialCourtInformationFields.trialCourtInformationTrialByJudge;
    public readonly trialByJury: FieldDefinition<BooleanFieldModel> = this.schema.trialCourtInformationFields.trialCourtInformationTrialByJury;
    public readonly defendantDidNotAppear: FieldDefinition<BooleanFieldModel> = this.schema.trialCourtInformationFields.trialCourtInformationDefendantDidNotAppear;
    public readonly defendantAppeared: FieldDefinition<BooleanFieldModel> = this.schema.trialCourtInformationFields.trialCourtInformationDefendantAppeared;
    public readonly dispositionDate: FieldDefinition<StringFieldModel> = this.schema.trialCourtInformationFields.trialCourtInformationDispositionDate;
    public readonly nolleProssed: FieldDefinition<BooleanFieldModel> = this.schema.trialCourtInformationFields.trialCourtInformationNolleProssed;
    public readonly guilty: FieldDefinition<BooleanFieldModel> = this.schema.trialCourtInformationFields.trialCourtInformationGuilty;
    public readonly forfeitedBond: FieldDefinition<BooleanFieldModel> = this.schema.trialCourtInformationFields.trialCourtInformationForfeitedBond;
    public readonly notGuilty: FieldDefinition<BooleanFieldModel> = this.schema.trialCourtInformationFields.trialCourtInformationNotGuilty;
    public readonly pledNoloContendere: FieldDefinition<BooleanFieldModel> = this.schema.trialCourtInformationFields.trialCourtInformationPledNoloContendere;
    public readonly determinedBac: FieldDefinition<BooleanFieldModel> = this.schema.trialCourtInformationFields.trialCourtInformationDeterminedBac;
    public readonly chargeConvictedOf: FieldDefinition<StringFieldModel> = this.schema.trialCourtInformationFields.trialCourtInformationChargeConvictedOf;
    public readonly sameAsOriginal: FieldDefinition<BooleanFieldModel> = this.schema.trialCourtInformationFields.trialCourtInformationSameAsOriginal;
    public readonly scPoints: FieldDefinition<NumberFieldModel> = this.schema.trialCourtInformationFields.trialCourtInformationScPoints;
    public readonly jail: FieldDefinition<StringFieldModel> = this.schema.trialCourtInformationFields.trialCourtInformationJail;
    public readonly suspend: FieldDefinition<StringFieldModel> = this.schema.trialCourtInformationFields.trialCourtInformationSuspend;
    public readonly fine: FieldDefinition<StringFieldModel> = this.schema.trialCourtInformationFields.trialCourtInformationFine;
    public readonly amountCollected: FieldDefinition<StringFieldModel> = this.schema.trialCourtInformationFields.trialCourtInformationAmountCollected;
    public readonly amountSuspended: FieldDefinition<StringFieldModel> = this.schema.trialCourtInformationFields.trialCourtInformationAmountSuspended;
    public readonly committedTo: FieldDefinition<StringFieldModel> = this.schema.trialCourtInformationFields.trialCourtInformationCommittedTo;
    public readonly vehicleSearched: FieldDefinition<BooleanFieldModel> = this.schema.trialCourtInformationFields.trialCourtInformationVehicleSearched;
    public readonly certifiedCorrect: FieldDefinition<StringFieldModel> = this.schema.trialCourtInformationFields.trialCourtInformationCertifiedCorrect;
    public readonly certifiedDate: FieldDefinition<StringFieldModel> = this.schema.trialCourtInformationFields.trialCourtInformationCertifiedDate;
    public readonly arrestResultOfCollision: FieldDefinition<BooleanFieldModel> = this.schema.trialCourtInformationFields.trialCourtInformationArrestResultOfCollision;

    public getCaseBeforeMagistrate(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.caseBeforeMagistrate); }
    public getCaseBeforeMunicipalCourt(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.caseBeforeMunicipalCourt); }
    public getCaseBeforeCircuitCourt(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.caseBeforeCircuitCourt); }
    public getCaseBeforeFamilyCourt(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.caseBeforeFamilyCourt); }
    public getCaseBeforeFederalCourt(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.caseBeforeFederalCourt); }
    public getCourtIfDifferent(): StringFieldModel { return this.get<StringFieldModel>(this.courtIfDifferent); }
    public getTrialByJudge(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.trialByJudge); }
    public getTrialByJury(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.trialByJury); }
    public getDefendantDidNotAppear(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.defendantDidNotAppear); }
    public getDefendantAppeared(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.defendantAppeared); }
    public getDispositionDate(): StringFieldModel { return this.get<StringFieldModel>(this.dispositionDate); }
    public getNolleProssed(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.nolleProssed); }
    public getGuilty(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.guilty); }
    public getForfeitedBond(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.forfeitedBond); }
    public getNotGuilty(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.notGuilty); }
    public getPledNoloContendere(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.pledNoloContendere); }
    public getDeterminedBac(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.determinedBac); }
    public getChargeConvictedOf(): StringFieldModel { return this.get<StringFieldModel>(this.chargeConvictedOf); }
    public getSameAsOriginal(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.sameAsOriginal); }
    public getScPoints(): NumberFieldModel { return this.get<NumberFieldModel>(this.scPoints); }
    public getJail(): StringFieldModel { return this.get<StringFieldModel>(this.jail); }
    public getSuspend(): StringFieldModel { return this.get<StringFieldModel>(this.suspend); }
    public getFine(): StringFieldModel { return this.get<StringFieldModel>(this.fine); }
    public getAmountCollected(): StringFieldModel { return this.get<StringFieldModel>(this.amountCollected); }
    public getAmountSuspended(): StringFieldModel { return this.get<StringFieldModel>(this.amountSuspended); }
    public getCommittedTo(): StringFieldModel { return this.get<StringFieldModel>(this.committedTo); }
    public getVehicleSearched(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.vehicleSearched); }
    public getCertifiedCorrect(): StringFieldModel { return this.get<StringFieldModel>(this.certifiedCorrect); }
    public getCertifiedDate(): StringFieldModel { return this.get<StringFieldModel>(this.certifiedDate); }
    public getArrestResultOfCollision(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.arrestResultOfCollision); }
}

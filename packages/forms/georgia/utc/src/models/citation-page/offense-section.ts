import { BooleanFieldModel, FieldDefinition, FormModel, ISection, SectionModel, StringFieldModel } from "@forms/core";
import { GAUTCFormSchema } from "../utc-form-schema";
import { selectExclusive } from "../exclusive-group";

export interface IOffenseSection extends ISection {
}

export interface IOffenseSectionModel extends IOffenseSection {
}

/** Model for the offense, companion case and remarks boxes of Section II. The citation holds one offense, so a record with several supplies the one it's issued for. The state law/local ordinance pair and the companion case YES/NO pair each hold at most one box. */
export class OffenseSectionModel extends SectionModel implements IOffenseSectionModel {
    private schema: GAUTCFormSchema = FormModel.getSchema<GAUTCFormSchema>(OffenseSectionModel);

    public readonly description: FieldDefinition<StringFieldModel> = this.schema.offenseFields.offenseDescription;
    public readonly codeSection: FieldDefinition<StringFieldModel> = this.schema.offenseFields.offenseCodeSection;
    public readonly stateLaw: FieldDefinition<BooleanFieldModel> = this.schema.offenseFields.offenseStateLaw;
    public readonly localOrdinance: FieldDefinition<BooleanFieldModel> = this.schema.offenseFields.offenseLocalOrdinance;
    public readonly companionCaseYes: FieldDefinition<BooleanFieldModel> = this.schema.offenseFields.offenseCompanionCaseYes;
    public readonly companionCaseNo: FieldDefinition<BooleanFieldModel> = this.schema.offenseFields.offenseCompanionCaseNo;
    public readonly companionCitation: FieldDefinition<StringFieldModel> = this.schema.offenseFields.offenseCompanionCitation;
    public readonly remarks: FieldDefinition<StringFieldModel> = this.schema.offenseFields.offenseRemarks;

    /** The companion case YES/NO pair. */
    public readonly companionCase: ReadonlyArray<FieldDefinition<BooleanFieldModel>> = [this.companionCaseYes, this.companionCaseNo];
    /** The state law / local ordinance pair naming which body of law the code section belongs to. */
    public readonly authority: ReadonlyArray<FieldDefinition<BooleanFieldModel>> = [this.stateLaw, this.localOrdinance];

    public getCodeSection(): StringFieldModel { return this.get<StringFieldModel>(this.codeSection); }
    public getCompanionCaseNo(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.companionCaseNo); }
    public getCompanionCaseYes(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.companionCaseYes); }
    public getCompanionCitation(): StringFieldModel { return this.get<StringFieldModel>(this.companionCitation); }
    public getDescription(): StringFieldModel { return this.get<StringFieldModel>(this.description); }
    public getLocalOrdinance(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.localOrdinance); }
    public getRemarks(): StringFieldModel { return this.get<StringFieldModel>(this.remarks); }
    public getStateLaw(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.stateLaw); }

    /** Returns a section with the given half of the state law / local ordinance pair checked and the other cleared. */
    public selectAuthority(selected: FieldDefinition<BooleanFieldModel>): this {
        return selectExclusive(this, this.authority, selected);
    }

    /** Returns a section with the given half of the companion case pair checked and the other cleared. */
    public selectCompanionCase(selected: FieldDefinition<BooleanFieldModel>): this {
        return selectExclusive(this, this.companionCase, selected);
    }
}

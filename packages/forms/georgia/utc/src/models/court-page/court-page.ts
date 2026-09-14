import { PageModel, SectionDefinition } from "@forms/core";
import { GAUTCFormSchema } from "../utc-form-schema";
import { CourtActionSectionModel } from "./court-action-section";
import { DispositionSectionModel } from "./disposition-section";
import { JudgmentSectionModel } from "./judgment-section";
import { PleaSectionModel } from "./plea-section";

export interface ICourtPage {
}

export interface ICourtPageModel extends ICourtPage {
}

/**
 * Represents the court page of the Georgia uniform traffic citation - the reverse of the court's copy, which the
 * clerk and the judge complete rather than the issuing officer.
 *
 * It registers no dropzones: nothing on this side of the citation is imported from a person or vehicle record.
 */
export class CourtPageModel extends PageModel implements ICourtPageModel {
    private formSchema: GAUTCFormSchema = this.getSchema<GAUTCFormSchema>();

    public readonly courtActionSection: SectionDefinition<CourtActionSectionModel> = this.formSchema.courtActionSection;
    public readonly pleaSection: SectionDefinition<PleaSectionModel> = this.formSchema.pleaSection;
    public readonly dispositionSection: SectionDefinition<DispositionSectionModel> = this.formSchema.dispositionSection;
    public readonly judgmentSection: SectionDefinition<JudgmentSectionModel> = this.formSchema.judgmentSection;

    public getCourtActionSection(): CourtActionSectionModel { return this.get<CourtActionSectionModel>(this.courtActionSection); }
    public getDispositionSection(): DispositionSectionModel { return this.get<DispositionSectionModel>(this.dispositionSection); }
    public getJudgmentSection(): JudgmentSectionModel { return this.get<JudgmentSectionModel>(this.judgmentSection); }
    public getPleaSection(): PleaSectionModel { return this.get<PleaSectionModel>(this.pleaSection); }
}

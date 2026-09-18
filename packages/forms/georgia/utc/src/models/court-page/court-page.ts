import { FormModel, PageModel, SectionDefinition } from "@forms/core";
import { GAUTCFormSchema } from "../utc-form-schema";
import { CourtActionSectionModel } from "./court-action-section";
import { DispositionSectionModel } from "./disposition-section";
import { JudgmentSectionModel } from "./judgment-section";
import { PleaSectionModel } from "./plea-section";

export interface ICourtPage {
}

export interface ICourtPageModel extends ICourtPage {
}

/** The court page -- the reverse of the citation, completed by the clerk and judge rather than the issuing officer. Registers no dropzones, since nothing here is imported from a person or vehicle record. */
export class CourtPageModel extends PageModel implements ICourtPageModel {
    private schema: GAUTCFormSchema = FormModel.getSchema<GAUTCFormSchema>(CourtPageModel);

    public readonly courtActionSection: SectionDefinition<CourtActionSectionModel> = this.schema.courtActionSection;
    public readonly pleaSection: SectionDefinition<PleaSectionModel> = this.schema.pleaSection;
    public readonly dispositionSection: SectionDefinition<DispositionSectionModel> = this.schema.dispositionSection;
    public readonly judgmentSection: SectionDefinition<JudgmentSectionModel> = this.schema.judgmentSection;

    public getCourtActionSection(): CourtActionSectionModel { return this.get<CourtActionSectionModel>(this.courtActionSection); }
    public getDispositionSection(): DispositionSectionModel { return this.get<DispositionSectionModel>(this.dispositionSection); }
    public getJudgmentSection(): JudgmentSectionModel { return this.get<JudgmentSectionModel>(this.judgmentSection); }
    public getPleaSection(): PleaSectionModel { return this.get<PleaSectionModel>(this.pleaSection); }
}

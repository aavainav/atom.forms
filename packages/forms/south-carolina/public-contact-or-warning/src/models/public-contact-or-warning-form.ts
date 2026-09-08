import { IForm, FormModel, PageCollection, PageDefinition } from "@forms/core";
import { PublicContactOrWarningFormSchema } from "./public-contact-or-warning-form-schema";
import { RecordPageModel } from "./record-page/record-page";

export interface IPublicContactOrWarningForm extends IForm {
}

export interface IPublicContactOrWarningFormModel extends IPublicContactOrWarningForm {
    readonly recordPage: PageDefinition<RecordPageModel>;
}

/** Represents the model for South Carolina Form 432 - Public Contact / Warning. */
export class PublicContactOrWarningFormModel extends FormModel implements IPublicContactOrWarningFormModel {
    public readonly type: "none" = "none";

    private schema: PublicContactOrWarningFormSchema = FormModel.getSchema<PublicContactOrWarningFormSchema>(PublicContactOrWarningFormSchema);
    public readonly recordPage: PageDefinition<RecordPageModel> = this.schema.recordPage;

    public async initialize(): Promise<this> {
        const form = await super.initialize();
        return form.addRuleCollection(this.schema.ruleCollection);
    }

    /** Retrieves the collection of record pages for the form. */
    public getRecordPageCollection(): PageCollection {
        return this.get<PageCollection>(this.recordPage);
    }
}

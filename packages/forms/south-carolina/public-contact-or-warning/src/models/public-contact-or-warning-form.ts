import { IForm, FormModel, PageCollection, PageDefinition } from "@forms/core";
import { PublicContactOrWarningFormSchema } from "./public-contact-or-warning-form-schema";
import { RecordPageModel } from "./record-page/record-page";

export interface IPublicContactOrWarningForm extends IForm {
}

export interface IPublicContactOrWarningFormModel extends IPublicContactOrWarningForm {
    readonly recordPage: PageDefinition<RecordPageModel>;
}

/**
 * The identity this form is registered under in the form catalog. The model stamps it on itself and the module
 * registers the catalog item, the mapper and the route from it, so the identity a saved report carries cannot
 * drift from the one the catalog resolves it by.
 */
export const CATALOG_IDENTITY = {
    name: "SC Form 432 - Public Contact / Warning",
    description: "South Carolina Form 432 (Rev. 06/2014) - Public Contact / Warning record, completed when a stop results in no citation and no arrest, per SC Code 56-5-6560(A).",
    version: "1.0"
} as const;

/** Represents the model for South Carolina Form 432 - Public Contact / Warning. */
export class PublicContactOrWarningFormModel extends FormModel implements IPublicContactOrWarningFormModel {
    public readonly name: string = CATALOG_IDENTITY.name;
    public readonly description: string = CATALOG_IDENTITY.description;
    public readonly version: string = CATALOG_IDENTITY.version;
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

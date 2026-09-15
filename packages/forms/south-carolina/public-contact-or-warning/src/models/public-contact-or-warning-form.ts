import { IForm, FormModel, PageCollection, PageDefinition } from "@forms/core";

import { CATALOG_IDENTITY } from "../module";
import { PublicContactOrWarningFormSchema } from "./public-contact-or-warning-form-schema";
import { RecordPageModel } from "./record-page/record-page";

import { IPublicContactOrWarningData, PublicContactOrWarningMapper } from "../mapping";
import { publicContactOrWarningValueLists } from "../value-lists";

export interface IPublicContactOrWarningForm extends IForm {
}

export interface IPublicContactOrWarningFormModel extends IPublicContactOrWarningForm {
    readonly recordPage: PageDefinition<RecordPageModel>;
}

/** Represents the model for South Carolina Form 432 - Public Contact / Warning. */
export class PublicContactOrWarningFormModel extends FormModel<IPublicContactOrWarningData> implements IPublicContactOrWarningFormModel {
    public readonly name: string = CATALOG_IDENTITY.name;
    public readonly description: string = CATALOG_IDENTITY.description;
    public readonly version: string = CATALOG_IDENTITY.version;

    public readonly mapper: PublicContactOrWarningMapper = new PublicContactOrWarningMapper();
    public readonly valueListIds: ReadonlyArray<string> = publicContactOrWarningValueLists.map(definition => definition.id);

    private schema: PublicContactOrWarningFormSchema = FormModel.getSchema<PublicContactOrWarningFormSchema>(PublicContactOrWarningFormModel);
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

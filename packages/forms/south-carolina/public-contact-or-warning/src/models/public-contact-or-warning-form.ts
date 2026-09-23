import { warningWorkflow, IForm, IWorkflow, FormModel, PageCollection, PageDefinition, WarningForm } from "@forms/core";

import { CATALOG_IDENTITY } from "../module";
import type { PublicContactOrWarningFormSchema } from "./public-contact-or-warning-form-schema";
import { RecordPageModel } from "./record-page/record-page";

import { IPublicContactOrWarningData, PublicContactOrWarningMapper } from "../mapping";
import { publicContactOrWarningValueLists } from "../value-lists";

export interface IPublicContactOrWarningForm extends IForm {
}

export interface IPublicContactOrWarningFormModel extends IPublicContactOrWarningForm {
    readonly recordPage: PageDefinition<RecordPageModel>;
}

/** Represents the model for South Carolina Form 432 - Public Contact / Warning. */
export class PublicContactOrWarningFormModel extends WarningForm<IPublicContactOrWarningData> implements IPublicContactOrWarningFormModel {
    public readonly name: string = CATALOG_IDENTITY.name;
    public readonly description: string = CATALOG_IDENTITY.description;
    public readonly version: string = CATALOG_IDENTITY.version;

    public readonly mapper: PublicContactOrWarningMapper = new PublicContactOrWarningMapper();
    public readonly valueListIds: ReadonlyArray<string> = publicContactOrWarningValueLists.map(definition => definition.id);
    public readonly workflow: IWorkflow = warningWorkflow;

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

    public setIssuedDate(): this {
        return this;
    }

    public setIssuedTime(): this {
        return this;
    }

    /** Returns the form unchanged; Form 432 carries no ticket number of its own. */
    public setTicketNumber(): this {
        return this;
    }
}

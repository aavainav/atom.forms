import { FormModel, PageDefinition, PageModel } from "@forms/core";
import { PublicContactOrWarningFormModel } from "./models/public-contact-or-warning-form";
import { PublicContactOrWarningFormSchema } from "./models/public-contact-or-warning-form-schema";
import { RecordPageModel } from "./models/record-page/record-page";

export class PublicContactOrWarningFormFactory {
    readonly name: string = "Public Contact or Warning Form";
    readonly version: string = "v2025";

    public createForm(): PublicContactOrWarningFormModel {
        return new PublicContactOrWarningFormModel();
    }

    public getPageTypes(): Map<string, PageDefinition<PageModel>> {
        const schema = FormModel.getSchema<PublicContactOrWarningFormSchema>(PublicContactOrWarningFormSchema);

        return new Map<string, PageDefinition<PageModel>>([
            ["record-page", schema.recordPage as PageDefinition<RecordPageModel>]
        ]);
    }
}

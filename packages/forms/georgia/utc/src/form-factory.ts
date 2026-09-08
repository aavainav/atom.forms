import { FormModel, PageDefinition, PageModel } from "@forms/core";
import { GAUTCFormModel } from "./models/utc-form";
import { GAUTCFormSchema } from "./models/utc-form-schema";

export class GAUTCFormFactory {
    readonly name: string = "GA UTC Form";
    readonly version: string = "v2026";

    public createForm(): GAUTCFormModel {
        return new GAUTCFormModel();
    }

    public getPageTypes(): Map<string, PageDefinition<PageModel>> {
        const schema = FormModel.getSchema<GAUTCFormSchema>(GAUTCFormSchema);

        return new Map<string, PageDefinition<PageModel>>([
            ["citation-page", schema.citationPage as PageDefinition<PageModel>],
            ["court-page", schema.courtPage as PageDefinition<PageModel>]
        ]);
    }
}

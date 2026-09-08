import { FormModel, PageDefinition, PageModel } from "@forms/core";
import { OKTrafficFormModel } from "./models/traffic-form";
import { OKTrafficFormSchema } from "./models/traffic-form-schema";

export class OKTrafficFormFactory {
    readonly name: string = "OKC Traffic Citation Form";
    readonly version: string = "v2026";

    public createForm(): OKTrafficFormModel {
        return new OKTrafficFormModel();
    }

    public getPageTypes(): Map<string, PageDefinition<PageModel>> {
        const schema = FormModel.getSchema<OKTrafficFormSchema>(OKTrafficFormSchema);

        return new Map<string, PageDefinition<PageModel>>([
            ["complaint-page", schema.complaintPage as PageDefinition<PageModel>],
            ["warrant-page", schema.warrantPage as PageDefinition<PageModel>],
            ["supplement-page", schema.supplementPage as PageDefinition<PageModel>]
        ]);
    }
}

import { FormModel, PageDefinition, PageModel } from "@forms/core";
import { S438FormModel } from "./models/s438-form";
import { S438FormSchema } from "./models/s438-form-schema";

export class S438FormFactory {
    readonly name: string = "S438 Form";
    readonly version: string = "v2025";

    public createForm(): S438FormModel {
        return new S438FormModel();
    }

    public getPageTypes(): Map<string, PageDefinition<PageModel>> {
        const schema = FormModel.getSchema<S438FormSchema>(S438FormSchema);

        return new Map<string, PageDefinition<PageModel>>([
            ["front-page", schema.frontPage as PageDefinition<PageModel>],
            ["notice-page", schema.noticePage as PageDefinition<PageModel>]
        ]);
    }
}

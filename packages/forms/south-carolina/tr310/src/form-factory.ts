import { FormModel, PageDefinition, PageModel } from "@forms/core";
import { TR310FormModel } from "./models/tr310-form";
import { TR310FormSchema } from "./models/tr310-form-schema";

export class TR310FormFactory {
    readonly name: string = "TR-310 Form";
    readonly version: string = "v2024";

    public createForm(): TR310FormModel {
        return new TR310FormModel();
    }

    public getPageTypes(): Map<string, PageDefinition<PageModel>> {
        const schema = FormModel.getSchema<TR310FormSchema>(TR310FormSchema);

        return new Map<string, PageDefinition<PageModel>>([
            ["collision-page", schema.collisionPage as PageDefinition<PageModel>],
            ["person-page", schema.personPage as PageDefinition<PageModel>],
            ["unit-page", schema.unitPage as PageDefinition<PageModel>],
            ["narrative-page", schema.narrativePage as PageDefinition<PageModel>]
        ]);
    }
}

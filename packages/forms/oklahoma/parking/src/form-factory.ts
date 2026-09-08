import { FormModel, PageDefinition, PageModel } from "@forms/core";
import { OKParkingFormModel } from "./models/parking-form";
import { OKParkingFormSchema } from "./models/parking-form-schema";
import { CitationPageModel } from "./models/citation-page/citation-page";

export class OKParkingFormFactory {
    readonly name: string = "OKC Parking Violation Form";
    readonly version: string = "v2026";

    public createForm(): OKParkingFormModel {
        return new OKParkingFormModel();
    }

    public getPageTypes(): Map<string, PageDefinition<PageModel>> {
        const schema = FormModel.getSchema<OKParkingFormSchema>(OKParkingFormSchema);

        return new Map<string, PageDefinition<PageModel>>([
            ["citation-page", schema.citationPage as PageDefinition<CitationPageModel>],
            ["complaint-page", schema.complaintPage as PageDefinition<PageModel>],
            ["detail-page", schema.detailPage as PageDefinition<PageModel>]
        ]);
    }
}

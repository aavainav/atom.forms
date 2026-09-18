import { describe, expect, it } from "vitest";
import { FormModel, IImportableViolation, PageCollection } from "@forms/core";

import type { CitationPageModel } from "../../../../src/models/citation-page/citation-page";
import { CitationPageViolationDropzone } from "../../../../src/models/citation-page/dropzones/citation-page-violation-dropzone";
import { OKParkingFormModel } from "../../../../src/models/parking-form";
import { OKParkingFormSchema } from "../../../../src/models/parking-form-schema";
import { createForm } from "../../../fixtures/form";

const schema = FormModel.getSchema<OKParkingFormSchema>(OKParkingFormModel);

describe("CitationPageViolationDropzone", () => {
    it("maps code and description onto the violation section's boxes", async () => {
        const form = await createForm();
        const page = form.get<PageCollection>(schema.citationPage).pages[0] as CitationPageModel;

        const data: IImportableViolation = { code: "18-100", description: "No parking zone", statute: "18-100" };

        const fields = page.getDropzone(CitationPageViolationDropzone).onDrop(data).getFields();

        expect(fields.code?.getValue()).toBe("18-100");
        expect(fields.description?.getValue()).toBe("No parking zone");
    });

    it("ignores statute, since the citation prints its own municipal code instead", async () => {
        const form = await createForm();
        const page = form.get<PageCollection>(schema.citationPage).pages[0] as CitationPageModel;

        const data: IImportableViolation = { code: "18-100", description: "No parking zone", statute: "18-100" };

        const fields = page.getDropzone(CitationPageViolationDropzone).onDrop(data).getFields();

        expect(fields).not.toHaveProperty("statute");
    });
});

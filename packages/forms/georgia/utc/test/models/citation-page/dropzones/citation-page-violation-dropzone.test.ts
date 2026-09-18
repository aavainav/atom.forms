import { describe, expect, it } from "vitest";
import { FormModel, IImportableViolation, PageCollection } from "@forms/core";

import type { CitationPageModel } from "../../../../src/models/citation-page/citation-page";
import { CitationPageViolationDropzone } from "../../../../src/models/citation-page/dropzones/citation-page-violation-dropzone";
import { GAUTCFormModel } from "../../../../src/models/utc-form";
import { GAUTCFormSchema } from "../../../../src/models/utc-form-schema";
import { createForm } from "../../../fixtures/form";

const schema = FormModel.getSchema<GAUTCFormSchema>(GAUTCFormModel);

describe("CitationPageViolationDropzone", () => {
    it("maps description and statute onto the offense section's boxes", async () => {
        const form = await createForm();
        const page = form.get<PageCollection>(schema.citationPage).pages[0] as CitationPageModel;

        const data: IImportableViolation = { code: "40-6-181", description: "Speeding", statute: "40-6-181", fine: 200, points: 4 };

        const fields = page.getDropzone(CitationPageViolationDropzone).onDrop(data).getFields();

        expect(fields.description?.getValue()).toBe("Speeding");
        expect(fields.statute?.getValue()).toBe("40-6-181");
    });

    it("ignores code, fine and points, since the citation page prints none of them from a drop", async () => {
        const form = await createForm();
        const page = form.get<PageCollection>(schema.citationPage).pages[0] as CitationPageModel;

        const data: IImportableViolation = { code: "40-6-181", description: "Speeding", statute: "40-6-181", fine: 200, points: 4 };

        const fields = page.getDropzone(CitationPageViolationDropzone).onDrop(data).getFields();

        expect(fields).not.toHaveProperty("code");
        expect(fields).not.toHaveProperty("fine");
        expect(fields).not.toHaveProperty("points");
    });
});

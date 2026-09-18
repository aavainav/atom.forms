import { describe, expect, it } from "vitest";
import { FormModel, IImportableViolation, PageCollection } from "@forms/core";

import type { ComplaintPageModel } from "../../../../src/models/complaint-page/complaint-page";
import { ComplaintPageViolationDropzone } from "../../../../src/models/complaint-page/dropzones/complaint-page-violation-dropzone";
import { OKTrafficFormModel } from "../../../../src/models/traffic-form";
import { OKTrafficFormSchema } from "../../../../src/models/traffic-form-schema";
import { createForm } from "../../../fixtures/form";

const schema = FormModel.getSchema<OKTrafficFormSchema>(OKTrafficFormModel);

describe("ComplaintPageViolationDropzone", () => {
    it("maps code onto the municipal code box and statute onto the offense code box", async () => {
        const form = await createForm();
        const page = form.get<PageCollection>(schema.complaintPage).pages[0] as ComplaintPageModel;

        const data: IImportableViolation = { code: "11-11-101", description: "Speeding", statute: "11-11-101" };

        const fields = page.getDropzone(ComplaintPageViolationDropzone).onDrop(data).getFields();

        expect(fields.code?.getValue()).toBe("11-11-101");
        expect(fields.statute?.getValue()).toBe("11-11-101");
    });

    it("ignores description, since the complaint identifies the charge by codes alone", async () => {
        const form = await createForm();
        const page = form.get<PageCollection>(schema.complaintPage).pages[0] as ComplaintPageModel;

        const data: IImportableViolation = { code: "11-11-101", description: "Speeding", statute: "11-11-101" };

        const fields = page.getDropzone(ComplaintPageViolationDropzone).onDrop(data).getFields();

        expect(fields).not.toHaveProperty("description");
    });
});

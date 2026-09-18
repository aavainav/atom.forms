import { describe, expect, it } from "vitest";
import { FormModel, IImportableVehicle, PageCollection } from "@forms/core";

import type { ComplaintPageModel } from "../../../../src/models/complaint-page/complaint-page";
import { ComplaintPageVehicleDropzone } from "../../../../src/models/complaint-page/dropzones/complaint-page-vehicle-dropzone";
import { OKTrafficFormModel } from "../../../../src/models/traffic-form";
import { OKTrafficFormSchema } from "../../../../src/models/traffic-form-schema";
import { createForm } from "../../../fixtures/form";

const schema = FormModel.getSchema<OKTrafficFormSchema>(OKTrafficFormModel);

describe("ComplaintPageVehicleDropzone", () => {
    it("holds the dropped make and model as option values, with no code, ready for the service to resolve", async () => {
        const form = await createForm();
        const page = form.get<PageCollection>(schema.complaintPage).pages[0] as ComplaintPageModel;

        const data: IImportableVehicle = { make: "TOYOTA", model: "CAMRY", year: 2021 };

        const fields = page.getDropzone(ComplaintPageVehicleDropzone).onDrop(data).getFields();

        expect(fields.make?.getValue()).toEqual({ value: "", description: "TOYOTA" });
        expect(fields.model?.getValue()).toEqual({ value: "", description: "CAMRY" });
        expect(fields.year?.getValue()).toBe(2021);
    });
});

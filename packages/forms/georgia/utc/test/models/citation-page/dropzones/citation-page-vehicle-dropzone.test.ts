import { describe, expect, it } from "vitest";
import { FormModel, IImportableVehicle, PageCollection } from "@forms/core";

import type { CitationPageModel } from "../../../../src/models/citation-page/citation-page";
import { CitationPageVehicleDropzone } from "../../../../src/models/citation-page/dropzones/citation-page-vehicle-dropzone";
import { GAUTCFormModel } from "../../../../src/models/utc-form";
import { GAUTCFormSchema } from "../../../../src/models/utc-form-schema";
import { createForm } from "../../../fixtures/form";

const schema = FormModel.getSchema<GAUTCFormSchema>(GAUTCFormModel);

describe("CitationPageVehicleDropzone", () => {
    it("holds the dropped make and model as option values, with no code, ready for the service to resolve", async () => {
        const form = await createForm();
        const page = form.get<PageCollection>(schema.citationPage).pages[0] as CitationPageModel;

        const data: IImportableVehicle = { make: "TOYOTA", model: "CAMRY", year: 2021 };

        const fields = page.getDropzone(CitationPageVehicleDropzone).onDrop(data).getFields();

        expect(fields.make?.getValue()).toEqual({ value: "", description: "TOYOTA" });
        expect(fields.model?.getValue()).toEqual({ value: "", description: "CAMRY" });
        expect(fields.year?.getValue()).toBe(2021);
    });
});

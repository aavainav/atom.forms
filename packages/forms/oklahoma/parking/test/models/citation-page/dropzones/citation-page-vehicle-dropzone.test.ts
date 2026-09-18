import { describe, expect, it } from "vitest";
import { FormModel, IImportableVehicle, PageCollection } from "@forms/core";

import type { CitationPageModel } from "../../../../src/models/citation-page/citation-page";
import { CitationPageVehicleDropzone } from "../../../../src/models/citation-page/dropzones/citation-page-vehicle-dropzone";
import { OKParkingFormModel } from "../../../../src/models/parking-form";
import { OKParkingFormSchema } from "../../../../src/models/parking-form-schema";
import { createForm } from "../../../fixtures/form";

const schema = FormModel.getSchema<OKParkingFormSchema>(OKParkingFormModel);

describe("CitationPageVehicleDropzone", () => {
    it("holds the dropped make as an option value, with no code, ready for the service to resolve", async () => {
        const form = await createForm();
        const page = form.get<PageCollection>(schema.citationPage).pages[0] as CitationPageModel;

        const data: IImportableVehicle = { make: "TOYOTA", model: "CAMRY", year: 2021 };

        const fields = page.getDropzone(CitationPageVehicleDropzone).onDrop(data).getFields();

        expect(fields.make?.getValue()).toEqual({ value: "", description: "TOYOTA" });
    });

    it("ignores model and year, since only make lives on the citation page", async () => {
        const form = await createForm();
        const page = form.get<PageCollection>(schema.citationPage).pages[0] as CitationPageModel;

        const data: IImportableVehicle = { make: "TOYOTA", model: "CAMRY", year: 2021 };

        const fields = page.getDropzone(CitationPageVehicleDropzone).onDrop(data).getFields();

        expect(fields).not.toHaveProperty("model");
        expect(fields).not.toHaveProperty("year");
    });
});

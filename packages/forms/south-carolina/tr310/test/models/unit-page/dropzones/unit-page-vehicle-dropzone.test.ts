import { describe, expect, it } from "vitest";
import { FormModel, IImportableVehicle, PageCollection } from "@forms/core";

import type { UnitPageModel } from "../../../../src/models/unit-page/unit-page";
import { UnitPageVehicleDropzone } from "../../../../src/models/unit-page/dropzones/unit-page-vehicle-dropzone";
import { TR310FormModel } from "../../../../src/models/tr310-form";
import { TR310FormSchema } from "../../../../src/models/tr310-form-schema";
import { createForm } from "../../../fixtures/form";

const schema = FormModel.getSchema<TR310FormSchema>(TR310FormModel);

describe("UnitPageVehicleDropzone", () => {
    it("holds the dropped make and model as option values, with no code, ready for the service to resolve", async () => {
        const form = await createForm();
        const page = form.get<PageCollection>(schema.unitPage).pages[0] as UnitPageModel;

        const data: IImportableVehicle = { make: "TOYOTA", model: "CAMRY", year: 2021 };

        const fields = page.getDropzone(UnitPageVehicleDropzone).onDrop(data).getFields();

        expect(fields.make?.getValue()).toEqual({ value: "", description: "TOYOTA" });
        expect(fields.model?.getValue()).toEqual({ value: "", description: "CAMRY" });
        expect(fields.year?.getValue()).toBe(2021);
    });
});

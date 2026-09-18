import { describe, expect, it } from "vitest";
import { FormModel, IImportableVehicle, PageCollection } from "@forms/core";

import type { FrontPageModel } from "../../../../src/models/front-page/front-page";
import { FrontPageVehicleDropzone } from "../../../../src/models/front-page/dropzones/front-page-vehicle-dropzone";
import { S438FormModel } from "../../../../src/models/s438-form";
import { S438FormSchema } from "../../../../src/models/s438-form-schema";
import { createForm } from "../../../fixtures/form";

const schema = FormModel.getSchema<S438FormSchema>(S438FormModel);

describe("FrontPageVehicleDropzone", () => {
    it("maps make and year onto the fields the form prints", async () => {
        const form = await createForm();
        const page = form.get<PageCollection>(schema.frontPage).pages[0] as FrontPageModel;

        const data: IImportableVehicle = { make: "Toyota", model: "Camry", year: 2021 };

        const fields = page.getDropzone(FrontPageVehicleDropzone).onDrop(data).getFields();

        expect(fields.make?.getValue()).toBe("Toyota");
        expect(fields.year?.getValue()).toBe(2021);
    });

    it("ignores model, since the S438 has no field for it", async () => {
        const form = await createForm();
        const page = form.get<PageCollection>(schema.frontPage).pages[0] as FrontPageModel;

        const data: IImportableVehicle = { make: "Toyota", model: "Camry", year: 2021 };

        const fields = page.getDropzone(FrontPageVehicleDropzone).onDrop(data).getFields();

        expect(fields).not.toHaveProperty("model");
    });
});

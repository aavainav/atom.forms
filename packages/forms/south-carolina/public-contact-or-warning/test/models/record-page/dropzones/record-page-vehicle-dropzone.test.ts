import { describe, expect, it } from "vitest";
import { IImportableVehicle } from "@forms/core";

import type { RecordPageModel } from "../../../../src/models/record-page/record-page";
import { RecordPageVehicleDropzone } from "../../../../src/models/record-page/dropzones/record-page-vehicle-dropzone";
import { createForm } from "../../../fixtures/form";

describe("RecordPageVehicleDropzone", () => {
    it("holds the dropped make and model as option values, with no code, ready for the service to resolve", async () => {
        const form = await createForm();
        const page = form.getRecordPageCollection().getFirstPage<RecordPageModel>();

        const data: IImportableVehicle = { make: "TOYOTA", model: "CAMRY", year: 2021 };

        const fields = page.getDropzone(RecordPageVehicleDropzone).onDrop(data).getFields();

        expect(fields.make?.getValue()).toEqual({ value: "", description: "TOYOTA" });
        expect(fields.model?.getValue()).toEqual({ value: "", description: "CAMRY" });
        expect(fields.year?.getValue()).toBe(2021);
    });
});

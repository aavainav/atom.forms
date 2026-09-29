import { describe, expect, it } from "vitest";
import { IImportableVehicle } from "@forms/core";

import { TrialPageModel } from "../../../../src/models/trial-page/trial-page";
import { TrialPageVehicleDropzone } from "../../../../src/models/trial-page/dropzones/trial-page-vehicle-dropzone";
import { createForm } from "../../../fixtures/form";

describe("TrialPageVehicleDropzone", () => {
    const data: IImportableVehicle = { make: "Toyota", model: "Camry", year: 2021 };

    async function getDropzone(): Promise<TrialPageVehicleDropzone> {
        const form = await createForm();
        return form.getTrialPageCollection().getFirstPage<TrialPageModel>().getDropzone(TrialPageVehicleDropzone);
    }

    it("maps make and year onto the fields the trial copy prints", async () => {
        const fields = (await getDropzone()).onDrop(data).getFields();

        expect(fields.make?.getValue()).toBe("Toyota");
        expect(fields.year?.getValue()).toBe(2021);
    });

    it("ignores model, since the S438 has no field for it", async () => {
        expect((await getDropzone()).onDrop(data).getFields()).not.toHaveProperty("model");
    });
});

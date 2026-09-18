import { describe, expect, it } from "vitest";
import { FormModel, IImportablePerson, PageCollection } from "@forms/core";

import type { DetailPageModel } from "../../../../src/models/detail-page/detail-page";
import { DetailPageOwnerDropzone } from "../../../../src/models/detail-page/dropzones/detail-page-owner-dropzone";
import { OKParkingFormModel } from "../../../../src/models/parking-form";
import { OKParkingFormSchema } from "../../../../src/models/parking-form-schema";
import { createForm } from "../../../fixtures/form";

const schema = FormModel.getSchema<OKParkingFormSchema>(OKParkingFormModel);

describe("DetailPageOwnerDropzone", () => {
    it("maps every field but state onto the registered owner section", async () => {
        const form = await createForm();
        const page = form.get<PageCollection>(schema.detailPage).pages[0] as DetailPageModel;

        const data: IImportablePerson = {
            firstName: "James",
            middleName: "Robert",
            lastName: "Whitfield",
            address: "412 Main Street",
            city: "Oklahoma City",
            state: "OK",
            zipCode: "73102"
        };

        const fields = page.getDropzone(DetailPageOwnerDropzone).onDrop(data).getFields();

        expect(fields.first_name?.getValue()).toBe("James");
        expect(fields.middle_name?.getValue()).toBe("Robert");
        expect(fields.last_name?.getValue()).toBe("Whitfield");
        expect(fields.address?.getValue()).toBe("412 Main Street");
        expect(fields.city?.getValue()).toBe("Oklahoma City");
        expect(fields.zip_code?.getValue()).toBe("73102");
    });

    it("ignores state, since the section holds it as a value-list code a dropped name can't supply", async () => {
        const form = await createForm();
        const page = form.get<PageCollection>(schema.detailPage).pages[0] as DetailPageModel;

        const data: IImportablePerson = { firstName: "James", lastName: "Whitfield", state: "OK" };

        const fields = page.getDropzone(DetailPageOwnerDropzone).onDrop(data).getFields();

        expect(fields).not.toHaveProperty("state");
    });
});

import { describe, expect, it } from "vitest";
import { FormModel, IImportablePerson, PageCollection } from "@forms/core";

import type { ComplaintPageModel } from "../../../../src/models/complaint-page/complaint-page";
import { ComplaintPageDefendantDropzone } from "../../../../src/models/complaint-page/dropzones/complaint-page-defendant-dropzone";
import { OKTrafficFormModel } from "../../../../src/models/traffic-form";
import { OKTrafficFormSchema } from "../../../../src/models/traffic-form-schema";
import { createForm } from "../../../fixtures/form";

const schema = FormModel.getSchema<OKTrafficFormSchema>(OKTrafficFormModel);

describe("ComplaintPageDefendantDropzone", () => {
    it("maps every field but state onto the defendant section", async () => {
        const form = await createForm();
        const page = form.get<PageCollection>(schema.complaintPage).pages[0] as ComplaintPageModel;

        const data: IImportablePerson = {
            firstName: "James",
            middleName: "Robert",
            lastName: "Whitfield",
            address: "412 Main Street",
            city: "Oklahoma City",
            state: "OK",
            zipCode: "73102"
        };

        const fields = page.getDropzone(ComplaintPageDefendantDropzone).onDrop(data).getFields();

        expect(fields.first_name?.getValue()).toBe("James");
        expect(fields.middle_name?.getValue()).toBe("Robert");
        expect(fields.last_name?.getValue()).toBe("Whitfield");
        expect(fields.address?.getValue()).toBe("412 Main Street");
        expect(fields.city?.getValue()).toBe("Oklahoma City");
        expect(fields.zip_code?.getValue()).toBe("73102");
    });

    it("ignores state, since the section holds it as a value-list code a dropped name can't supply", async () => {
        const form = await createForm();
        const page = form.get<PageCollection>(schema.complaintPage).pages[0] as ComplaintPageModel;

        const data: IImportablePerson = { firstName: "James", lastName: "Whitfield", state: "OK" };

        const fields = page.getDropzone(ComplaintPageDefendantDropzone).onDrop(data).getFields();

        expect(fields).not.toHaveProperty("state");
    });
});

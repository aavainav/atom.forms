import { describe, expect, it } from "vitest";
import { IImportablePerson } from "@forms/core";

import type { RecordPageModel } from "../../../../src/models/record-page/record-page";
import { RecordPagePersonDropzone } from "../../../../src/models/record-page/dropzones/record-page-person-dropzone";
import { createForm } from "../../../fixtures/form";

describe("RecordPagePersonDropzone", () => {
    it("maps first name, middle initial and last name onto the person section", async () => {
        const form = await createForm();
        const page = form.getRecordPageCollection().getFirstPage<RecordPageModel>();

        const data: IImportablePerson = { firstName: "James", middleName: "Robert", lastName: "Whitfield" };

        const fields = page.getDropzone(RecordPagePersonDropzone).onDrop(data).getFields();

        expect(fields.first_name?.getValue()).toBe("James");
        expect(fields.middle_name?.getValue()).toBe("Robert");
        expect(fields.last_name?.getValue()).toBe("Whitfield");
    });

    it("ignores address, city, state and zip, since the record has no fields for them", async () => {
        const form = await createForm();
        const page = form.getRecordPageCollection().getFirstPage<RecordPageModel>();

        const data: IImportablePerson = {
            firstName: "James",
            lastName: "Whitfield",
            address: "412 Meeting Street",
            city: "Charleston",
            state: "SC",
            zipCode: "29403"
        };

        const fields = page.getDropzone(RecordPagePersonDropzone).onDrop(data).getFields();

        expect(fields).not.toHaveProperty("address");
        expect(fields).not.toHaveProperty("city");
        expect(fields).not.toHaveProperty("state");
        expect(fields).not.toHaveProperty("zip_code");
    });
});

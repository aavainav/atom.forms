import { describe, expect, it } from "vitest";
import { FormModel, IImportablePerson, PageCollection } from "@forms/core";

import type { PersonPageModel } from "../../../../src/models/person-page/person-page";
import { PersonPagePersonDropzone } from "../../../../src/models/person-page/dropzones/person-page-person-dropzone";
import { TR310FormModel } from "../../../../src/models/tr310-form";
import { TR310FormSchema } from "../../../../src/models/tr310-form-schema";
import { createForm } from "../../../fixtures/form";

const schema = FormModel.getSchema<TR310FormSchema>(TR310FormModel);

describe("PersonPagePersonDropzone", () => {
    it("maps every field but state onto the person section", async () => {
        const form = await createForm();
        const page = form.get<PageCollection>(schema.personPage).pages[0] as PersonPageModel;

        const data: IImportablePerson = {
            firstName: "James",
            middleName: "Robert",
            lastName: "Whitfield",
            address: "88 King Street",
            city: "Charleston",
            state: "SC",
            zipCode: "29401"
        };

        const fields = page.getDropzone(PersonPagePersonDropzone).onDrop(data).getFields();

        expect(fields.first_name?.getValue()).toBe("James");
        expect(fields.middle_name?.getValue()).toBe("Robert");
        expect(fields.last_name?.getValue()).toBe("Whitfield");
        expect(fields.address?.getValue()).toBe("88 King Street");
        expect(fields.city?.getValue()).toBe("Charleston");
        expect(fields.zip_code?.getValue()).toBe("29401");
    });

    it("ignores state, since the report holds it as a value-list code a dropped name can't supply", async () => {
        const form = await createForm();
        const page = form.get<PageCollection>(schema.personPage).pages[0] as PersonPageModel;

        const data: IImportablePerson = { firstName: "James", lastName: "Whitfield", state: "SC" };

        const fields = page.getDropzone(PersonPagePersonDropzone).onDrop(data).getFields();

        expect(fields).not.toHaveProperty("state");
    });
});

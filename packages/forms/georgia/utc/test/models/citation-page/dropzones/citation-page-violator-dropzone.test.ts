import { describe, expect, it } from "vitest";
import { FormModel, IImportablePerson, PageCollection } from "@forms/core";

import type { CitationPageModel } from "../../../../src/models/citation-page/citation-page";
import { CitationPageViolatorDropzone } from "../../../../src/models/citation-page/dropzones/citation-page-violator-dropzone";
import { GAUTCFormModel } from "../../../../src/models/utc-form";
import { GAUTCFormSchema } from "../../../../src/models/utc-form-schema";
import { createForm } from "../../../fixtures/form";

const schema = FormModel.getSchema<GAUTCFormSchema>(GAUTCFormModel);

describe("CitationPageViolatorDropzone", () => {
    it("maps every field but state onto the violator section", async () => {
        const form = await createForm();
        const page = form.get<PageCollection>(schema.citationPage).pages[0] as CitationPageModel;

        const data: IImportablePerson = {
            firstName: "James",
            middleName: "Robert",
            lastName: "Whitfield",
            address: "412 Peachtree Street NE",
            city: "Atlanta",
            state: "GA",
            zipCode: "30308"
        };

        const fields = page.getDropzone(CitationPageViolatorDropzone).onDrop(data).getFields();

        expect(fields.first_name?.getValue()).toBe("James");
        expect(fields.middle_name?.getValue()).toBe("Robert");
        expect(fields.last_name?.getValue()).toBe("Whitfield");
        expect(fields.address?.getValue()).toBe("412 Peachtree Street NE");
        expect(fields.city?.getValue()).toBe("Atlanta");
        expect(fields.zip_code?.getValue()).toBe("30308");
    });

    it("ignores state, since the section holds it as a value-list code a dropped name can't supply", async () => {
        const form = await createForm();
        const page = form.get<PageCollection>(schema.citationPage).pages[0] as CitationPageModel;

        const data: IImportablePerson = { firstName: "James", lastName: "Whitfield", state: "GA" };

        const fields = page.getDropzone(CitationPageViolatorDropzone).onDrop(data).getFields();

        expect(fields).not.toHaveProperty("state");
    });
});

import { describe, expect, it } from "vitest";
import { FormModel, IImportablePerson, PageCollection } from "@forms/core";

import type { FrontPageModel } from "../../../../src/models/front-page/front-page";
import { FrontPageOwnerDropzone } from "../../../../src/models/front-page/dropzones/front-page-owner-dropzone";
import { S438FormModel } from "../../../../src/models/s438-form";
import { S438FormSchema } from "../../../../src/models/s438-form-schema";
import { createForm } from "../../../fixtures/form";

const schema = FormModel.getSchema<S438FormSchema>(S438FormModel);

describe("FrontPageOwnerDropzone", () => {
    it("maps every dropped field onto its own owner section field", async () => {
        const form = await createForm();
        const page = form.get<PageCollection>(schema.frontPage).pages[0] as FrontPageModel;

        const data: IImportablePerson = {
            firstName: "James",
            middleName: "Robert",
            lastName: "Whitfield",
            address: "412 Meeting Street",
            city: "Charleston",
            state: "SC",
            zipCode: "29403"
        };

        const fields = page.getDropzone(FrontPageOwnerDropzone).onDrop(data).getFields();

        expect(fields.first_name?.getValue()).toBe("James");
        expect(fields.middle_name?.getValue()).toBe("Robert");
        expect(fields.last_name?.getValue()).toBe("Whitfield");
        expect(fields.address?.getValue()).toBe("412 Meeting Street");
        expect(fields.city?.getValue()).toBe("Charleston");
        expect(fields.state?.getValue()).toBe("SC");
        expect(fields.zip_code?.getValue()).toBe("29403");
    });
});

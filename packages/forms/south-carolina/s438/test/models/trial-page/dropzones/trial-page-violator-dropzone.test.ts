import { describe, expect, it } from "vitest";
import { IImportablePerson } from "@forms/core";

import { TrialPageModel } from "../../../../src/models/trial-page/trial-page";
import { TrialPageViolatorDropzone } from "../../../../src/models/trial-page/dropzones/trial-page-violator-dropzone";
import { createTrialForm } from "../../../fixtures/form";

describe("TrialPageViolatorDropzone", () => {
    it("maps every dropped field onto its own trial violator section field", async () => {
        const form = await createTrialForm();
        const page = form.getTrialPageCollection().getFirstPage<TrialPageModel>();

        const data: IImportablePerson = {
            firstName: "James",
            middleName: "Robert",
            lastName: "Whitfield",
            address: "412 Meeting Street",
            city: "Charleston",
            state: "SC",
            zipCode: "29403"
        };

        const fields = page.getDropzone(TrialPageViolatorDropzone).onDrop(data).getFields();

        expect(fields.first_name?.getValue()).toBe("James");
        expect(fields.middle_name?.getValue()).toBe("Robert");
        expect(fields.last_name?.getValue()).toBe("Whitfield");
        expect(fields.address?.getValue()).toBe("412 Meeting Street");
        expect(fields.city?.getValue()).toBe("Charleston");
        expect(fields.state?.getValue()).toBe("SC");
        expect(fields.zip_code?.getValue()).toBe("29403");
    });
});

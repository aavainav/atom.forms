import { describe, expect, it } from "vitest";
import { IImportablePerson } from "@forms/core";

import { TrialPageModel } from "../../../../src/models/trial-page/trial-page";
import { TrialPageOwnerDropzone } from "../../../../src/models/trial-page/dropzones/trial-page-owner-dropzone";
import { createTrialForm } from "../../../fixtures/form";

describe("TrialPageOwnerDropzone", () => {
    it("maps every dropped field onto its own trial owner section field", async () => {
        const form = await createTrialForm();
        const page = form.getTrialPageCollection().getFirstPage<TrialPageModel>();

        const data: IImportablePerson = {
            firstName: "Marion",
            middleName: "T",
            lastName: "Whitfield",
            address: "88 Broad Street",
            city: "Charleston",
            state: "SC",
            zipCode: "29401"
        };

        const fields = page.getDropzone(TrialPageOwnerDropzone).onDrop(data).getFields();

        expect(fields.first_name?.getValue()).toBe("Marion");
        expect(fields.middle_name?.getValue()).toBe("T");
        expect(fields.last_name?.getValue()).toBe("Whitfield");
        expect(fields.address?.getValue()).toBe("88 Broad Street");
        expect(fields.city?.getValue()).toBe("Charleston");
        expect(fields.state?.getValue()).toBe("SC");
        expect(fields.zip_code?.getValue()).toBe("29401");
    });
});

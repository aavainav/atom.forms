import { describe, expect, it } from "vitest";
import { IImportableViolation } from "@forms/core";

import { TrialPageModel } from "../../../../src/models/trial-page/trial-page";
import { TrialPageViolationDropzone } from "../../../../src/models/trial-page/dropzones/trial-page-violation-dropzone";
import { createTrialForm } from "../../../fixtures/form";

describe("TrialPageViolationDropzone", () => {
    const data: IImportableViolation = { code: "56-5-2930", description: "Failure to yield", statute: "56-5-2930", fine: 262, points: 4 };

    async function getDropzone(): Promise<TrialPageViolationDropzone> {
        const form = await createTrialForm();
        return form.getTrialPageCollection().getFirstPage<TrialPageModel>().getDropzone(TrialPageViolationDropzone);
    }

    it("maps description, statute and points onto the fields the trial copy prints", async () => {
        const fields = (await getDropzone()).onDrop(data).getFields();

        expect(fields.description?.getValue()).toBe("Failure to yield");
        expect(fields.statute?.getValue()).toBe("56-5-2930");
        expect(fields.points?.getValue()).toBe(4);
    });

    it("ignores code and fine, since the S438 prints neither", async () => {
        const fields = (await getDropzone()).onDrop(data).getFields();

        expect(fields).not.toHaveProperty("code");
        expect(fields).not.toHaveProperty("fine");
    });
});

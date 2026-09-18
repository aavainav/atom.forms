import { describe, expect, it } from "vitest";
import { FormModel, IImportableViolation, PageCollection } from "@forms/core";

import type { FrontPageModel } from "../../../../src/models/front-page/front-page";
import { FrontPageViolationDropzone } from "../../../../src/models/front-page/dropzones/front-page-violation-dropzone";
import { S438FormModel } from "../../../../src/models/s438-form";
import { S438FormSchema } from "../../../../src/models/s438-form-schema";
import { createForm } from "../../../fixtures/form";

const schema = FormModel.getSchema<S438FormSchema>(S438FormModel);

describe("FrontPageViolationDropzone", () => {
    async function getDropzone(): Promise<FrontPageViolationDropzone> {
        const form = await createForm();
        const page = form.get<PageCollection>(schema.frontPage).pages[0] as FrontPageModel;
        return page.getDropzone(FrontPageViolationDropzone);
    }

    it("maps description, statute and points onto the fields the form prints", async () => {
        const data: IImportableViolation = { code: "56-5-2930", description: "Failure to yield", statute: "56-5-2930", fine: 262, points: 4 };

        const fields = (await getDropzone()).onDrop(data).getFields();

        expect(fields.description?.getValue()).toBe("Failure to yield");
        expect(fields.statute?.getValue()).toBe("56-5-2930");
        expect(fields.points?.getValue()).toBe(4);
    });

    it("ignores code and fine, since the S438 prints neither", async () => {
        const data: IImportableViolation = { code: "56-5-2930", description: "Failure to yield", statute: "56-5-2930", fine: 262, points: 4 };

        const fields = (await getDropzone()).onDrop(data).getFields();

        expect(fields).not.toHaveProperty("code");
        expect(fields).not.toHaveProperty("fine");
    });
});

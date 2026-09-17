import { beforeEach, describe, expect, it } from "vitest";
import { ControllerManager, FormModel, PageCollection } from "@forms/core";
import type { IValueListService } from "@forms/value-lists";
import type { IViolation } from "@forms/violations";

import type { CitationPageModel } from "../../src/models/citation-page/citation-page";
import { GAUTCFormModel } from "../../src/models/utc-form";
import { GAUTCFormSchema } from "../../src/models/utc-form-schema";
import { GAUTCService } from "../../src/services/utc";
import { createForm } from "../fixtures/form";

const schema = FormModel.getSchema<GAUTCFormSchema>(GAUTCFormModel);

describe("GAUTCService", () => {
    // applyViolations/getAppliedViolations touch neither the value list service nor the dropzone helpers, so a
    // stub with no behavior is enough to construct the service
    const service = new GAUTCService({} as IValueListService);
    let controllers: ControllerManager;

    beforeEach(async () => {
        controllers = new ControllerManager();
        controllers.loadForm(await createForm());
    });

    function getCitationPage(): CitationPageModel {
        return controllers.getFormController().form.get<PageCollection>(schema.citationPage).pages[0] as CitationPageModel;
    }

    describe("applyViolations", () => {
        /**
         * Both methods resolve the schema through `FormModel.getSchema`, which is keyed by the form model's own
         * constructor rather than the schema's -- passing the wrong one throws "Definition for entity type ... is
         * not registered" the instant either method runs. That is exactly the regression this guards.
         */
        it("resolves the schema and writes the chosen violation onto the form's first page", async () => {
            const violation: IViolation = { code: "40-6-181", description: "Speeding", statute: "40-6-181" };

            await service.applyViolations(controllers, [violation], GAUTCFormModel);

            const section = getCitationPage().getOffenseSection();
            expect(section.getCodeSection().getValue()).toBe("40-6-181");
            expect(section.getDescription().getValue()).toBe("Speeding");
        });

        it("does nothing when there are no violations to apply", async () => {
            await expect(service.applyViolations(controllers, [], GAUTCFormModel)).resolves.toBeUndefined();
        });
    });

    describe("getAppliedViolations", () => {
        it("resolves the schema without throwing", () => {
            expect(() => service.getAppliedViolations(controllers, [], GAUTCFormModel)).not.toThrow();
        });

        it("narrows to the violations already carried on the form", async () => {
            const applied: IViolation = { code: "40-6-181", description: "Speeding", statute: "40-6-181" };
            const notApplied: IViolation = { code: "40-6-391", description: "DUI", statute: "40-6-391" };

            await service.applyViolations(controllers, [applied], GAUTCFormModel);

            expect(service.getAppliedViolations(controllers, [applied, notApplied], GAUTCFormModel)).toEqual([applied]);
        });
    });
});

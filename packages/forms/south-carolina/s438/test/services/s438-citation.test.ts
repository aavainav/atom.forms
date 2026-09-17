import { beforeEach, describe, expect, it } from "vitest";
import { ControllerManager, FormModel, PageCollection } from "@forms/core";
import type { IViolation } from "@forms/violations";

import type { FrontPageModel } from "../../src/models/front-page/front-page";
import { S438CitationService } from "../../src/services/s438-citation";
import { S438FormModel } from "../../src/models/s438-form";
import { S438FormSchema } from "../../src/models/s438-form-schema";
import { createForm } from "../fixtures/form";

const schema = FormModel.getSchema<S438FormSchema>(S438FormModel);

describe("S438CitationService", () => {
    const service = new S438CitationService();
    let controllers: ControllerManager;

    beforeEach(async () => {
        controllers = new ControllerManager();
        controllers.loadForm(await createForm());
    });

    function getFrontPage(): FrontPageModel {
        return controllers.getFormController().form.get<PageCollection>(schema.frontPage).pages[0] as FrontPageModel;
    }

    describe("applyViolations", () => {
        /**
         * Both methods resolve the schema through `FormModel.getSchema`, which is keyed by the form model's own
         * constructor rather than the schema's -- passing the wrong one throws "Definition for entity type ... is
         * not registered" the instant either method runs. That is exactly the regression this guards: every
         * assertion below is unreachable if the wrong constructor is wired through from `module.ts`.
         */
        it("resolves the schema and writes the chosen violation onto the form's first page", async () => {
            const violation: IViolation = { code: "56-5-2930", description: "Failure to yield", statute: "56-5-2930", points: 4 };

            await service.applyViolations(controllers, [violation], S438FormModel);

            const section = getFrontPage().getViolationSection();
            expect(section.getSectionNumber().getValue()).toBe("56-5-2930");
            expect(section.getDescription().getValue()).toBe("Failure to yield");
            expect(section.getScPoints().getValue()).toBe(4);
        });

        it("does nothing when there are no violations to apply", async () => {
            await expect(service.applyViolations(controllers, [], S438FormModel)).resolves.toBeUndefined();
        });
    });

    describe("getAppliedViolations", () => {
        it("resolves the schema without throwing", () => {
            expect(() => service.getAppliedViolations(controllers, [], S438FormModel)).not.toThrow();
        });

        it("narrows to the violations already carried on the form", async () => {
            const applied: IViolation = { code: "56-5-2930", description: "Failure to yield", statute: "56-5-2930" };
            const notApplied: IViolation = { code: "56-5-750", description: "Failure to stop for a blue light", statute: "56-5-750" };

            await service.applyViolations(controllers, [applied], S438FormModel);

            expect(service.getAppliedViolations(controllers, [applied, notApplied], S438FormModel)).toEqual([applied]);
        });
    });
});

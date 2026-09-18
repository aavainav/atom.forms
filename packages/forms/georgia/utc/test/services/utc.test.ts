import { beforeEach, describe, expect, it, vi } from "vitest";
import { ControllerManager, FormModel, PageCollection } from "@forms/core";
import type { IValueListService } from "@forms/value-lists";
import type { IViolation } from "@forms/violations";

import type { CitationPageModel } from "../../src/models/citation-page/citation-page";
import { CitationPageVehicleDropzone } from "../../src/models/citation-page/dropzones/citation-page-vehicle-dropzone";
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

        it("adds a page for each violation beyond the first, writing each onto its own page", async () => {
            const first: IViolation = { code: "40-6-181", description: "Speeding", statute: "40-6-181" };
            const second: IViolation = { code: "40-6-391", description: "DUI", statute: "40-6-391" };
            const third: IViolation = { code: "40-6-48", description: "Following too closely", statute: "40-6-48" };

            await service.applyViolations(controllers, [first, second, third], GAUTCFormModel);

            const pages = controllers.getFormController().form.get<PageCollection>(schema.citationPage).getPages<CitationPageModel>();

            expect(pages).toHaveLength(3);
            expect(pages[0].getOffenseSection().getCodeSection().getValue()).toBe("40-6-181");
            expect(pages[1].getOffenseSection().getCodeSection().getValue()).toBe("40-6-391");
            expect(pages[2].getOffenseSection().getCodeSection().getValue()).toBe("40-6-48");
        });

        it("adds to the citation on a later call rather than overwriting the violation already on it", async () => {
            const first: IViolation = { code: "40-6-181", description: "Speeding", statute: "40-6-181" };
            const second: IViolation = { code: "40-6-391", description: "DUI", statute: "40-6-391" };

            await service.applyViolations(controllers, [first], GAUTCFormModel);
            await service.applyViolations(controllers, [second], GAUTCFormModel);

            const pages = controllers.getFormController().form.get<PageCollection>(schema.citationPage).getPages<CitationPageModel>();

            expect(pages).toHaveLength(2);
            expect(pages[0].getOffenseSection().getCodeSection().getValue()).toBe("40-6-181");
            expect(pages[1].getOffenseSection().getCodeSection().getValue()).toBe("40-6-391");
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

    describe("resolveVehicleDropzone", () => {
        /**
         * The dropzone's own onDrop stores the dropped name as an option value (`{ value: "", description }`),
         * since make/model are value-list codes and a drop carries only a name. Reading a plain string instead --
         * what the base `VehicleDropzone.onDrop` stores -- is exactly the regression that once cleared every
         * dropped vehicle's make and model back to blank regardless of what was dropped.
         */
        it("resolves the dropped make and model to their stored codes", async () => {
            const valueListService: IValueListService = {
                findByDescription: vi.fn(async (_listId: string, description: string) =>
                    description === "TOYOTA" ? { value: "TOYT", description: "TOYOTA" } :
                    description === "CAMRY" ? { value: "CAM", description: "CAMRY" } : undefined)
            } as unknown as IValueListService;

            const dropzone = getCitationPage().getDropzone(CitationPageVehicleDropzone)
                .onDrop({ make: "TOYOTA", model: "CAMRY", year: 2021 });

            const resolved = await new GAUTCService(valueListService).resolveVehicleDropzone(dropzone);

            expect(resolved.getFields().make?.getValue()).toEqual({ value: "TOYT", description: "TOYOTA" });
            expect(resolved.getFields().model?.getValue()).toEqual({ value: "CAM", description: "CAMRY" });
        });

        it("clears make and model when the dropped name isn't found in either list", async () => {
            const valueListService: IValueListService = { findByDescription: vi.fn(async () => undefined) } as unknown as IValueListService;

            const dropzone = getCitationPage().getDropzone(CitationPageVehicleDropzone)
                .onDrop({ make: "NOT A REAL MAKE", model: "NOT A REAL MODEL", year: 2021 });

            const resolved = await new GAUTCService(valueListService).resolveVehicleDropzone(dropzone);

            expect(resolved.getFields().make?.getValue()).toEqual({ value: "", description: "" });
            expect(resolved.getFields().model?.getValue()).toEqual({ value: "", description: "" });
        });
    });
});

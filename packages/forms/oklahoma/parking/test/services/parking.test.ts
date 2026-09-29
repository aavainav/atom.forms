import { beforeEach, describe, expect, it, vi } from "vitest";
import { ControllerManager, FormModel, PageCollection } from "@forms/core";
import type { IValueListService } from "@forms/value-lists";
import type { IViolation } from "@forms/violations";

import type { CitationPageModel } from "../../src/models/citation-page/citation-page";
import { CitationPageVehicleDropzone } from "../../src/models/citation-page/dropzones/citation-page-vehicle-dropzone";
import { OKParkingFormModel } from "../../src/models/parking-form";
import { OKParkingFormSchema } from "../../src/models/parking-form-schema";
import { OKParkingService } from "../../src/services/parking";
import { createForm } from "../fixtures/form";

const schema = FormModel.getSchema<OKParkingFormSchema>(OKParkingFormModel);

describe("OKParkingService", () => {
    // applyViolations/getAppliedViolations touch neither the value list service nor the dropzone helpers, so a
    // stub with no behavior is enough to construct the service
    const service = new OKParkingService({} as IValueListService);
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
            const violation: IViolation = { id: "no-parking-zone", code: "18-100", description: "No parking zone" };

            await service.applyViolations(controllers, [violation], OKParkingFormModel);

            const section = getCitationPage().getViolationSection();
            expect(section.getCode().getValue()).toBe("18-100");
            expect(section.getDescription().getValue()).toBe("No parking zone");
        });

        it("does nothing when there are no violations to apply", async () => {
            await expect(service.applyViolations(controllers, [], OKParkingFormModel)).resolves.toBeUndefined();
        });

        it("adds a page for each violation beyond the first, writing each onto its own page", async () => {
            const first: IViolation = { id: "no-parking-zone", code: "18-100", description: "No parking zone" };
            const second: IViolation = { id: "expired-meter", code: "18-101", description: "Expired meter" };
            const third: IViolation = { id: "blocking-a-fire-lane", code: "18-102", description: "Blocking a fire lane" };

            await service.applyViolations(controllers, [first, second, third], OKParkingFormModel);

            const pages = controllers.getFormController().form.get<PageCollection>(schema.citationPage).getPages<CitationPageModel>();

            expect(pages).toHaveLength(3);
            expect(pages[0].getViolationSection().getCode().getValue()).toBe("18-100");
            expect(pages[1].getViolationSection().getCode().getValue()).toBe("18-101");
            expect(pages[2].getViolationSection().getCode().getValue()).toBe("18-102");
        });

        it("adds to the citation on a later call rather than overwriting the violation already on it", async () => {
            const first: IViolation = { id: "no-parking-zone", code: "18-100", description: "No parking zone" };
            const second: IViolation = { id: "expired-meter", code: "18-101", description: "Expired meter" };

            await service.applyViolations(controllers, [first], OKParkingFormModel);
            await service.applyViolations(controllers, [second], OKParkingFormModel);

            const pages = controllers.getFormController().form.get<PageCollection>(schema.citationPage).getPages<CitationPageModel>();

            expect(pages).toHaveLength(2);
            expect(pages[0].getViolationSection().getCode().getValue()).toBe("18-100");
            expect(pages[1].getViolationSection().getCode().getValue()).toBe("18-101");
        });
    });

    describe("getAppliedViolations", () => {
        it("resolves the schema without throwing", () => {
            expect(() => service.getAppliedViolations(controllers, [], OKParkingFormModel)).not.toThrow();
        });

        it("narrows to the violations already carried on the form", async () => {
            const applied: IViolation = { id: "no-parking-zone", code: "18-100", description: "No parking zone" };
            const notApplied: IViolation = { id: "expired-meter", code: "18-101", description: "Expired meter" };

            await service.applyViolations(controllers, [applied], OKParkingFormModel);

            expect(service.getAppliedViolations(controllers, [applied, notApplied], OKParkingFormModel)).toEqual([applied]);
        });
    });

    describe("resolveVehicleDropzone", () => {
        /**
         * The dropzone's own onDrop stores the dropped name as an option value (`{ value: "", description }`),
         * since make is a value-list code and a drop carries only a name. Reading a plain string instead -- what
         * the base `VehicleDropzone.onDrop` stores -- is exactly the regression that once cleared every dropped
         * vehicle's make back to blank regardless of what was dropped.
         */
        it("resolves the dropped make to its stored code", async () => {
            const valueListService: IValueListService = {
                findByDescription: vi.fn(async (_listId: string, description: string) =>
                    description === "TOYOTA" ? { value: "TOYT", description: "TOYOTA" } : undefined)
            } as unknown as IValueListService;

            const dropzone = getCitationPage().getDropzone(CitationPageVehicleDropzone)
                .onDrop({ make: "TOYOTA", model: "CAMRY", year: 2021 });

            const resolved = await new OKParkingService(valueListService).resolveVehicleDropzone(dropzone);

            expect(resolved.getFields().make?.getValue()).toEqual({ value: "TOYT", description: "TOYOTA" });
        });

        it("clears make when the dropped name isn't found in the list", async () => {
            const valueListService: IValueListService = { findByDescription: vi.fn(async () => undefined) } as unknown as IValueListService;

            const dropzone = getCitationPage().getDropzone(CitationPageVehicleDropzone)
                .onDrop({ make: "NOT A REAL MAKE", model: "CAMRY", year: 2021 });

            const resolved = await new OKParkingService(valueListService).resolveVehicleDropzone(dropzone);

            expect(resolved.getFields().make?.getValue()).toEqual({ value: "", description: "" });
        });
    });
});

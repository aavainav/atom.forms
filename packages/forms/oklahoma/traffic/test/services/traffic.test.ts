import { beforeEach, describe, expect, it, vi } from "vitest";
import { ControllerManager, FormModel, PageCollection } from "@forms/core";
import type { IValueListService } from "@forms/value-lists";
import type { IViolation } from "@forms/violations";

import type { ComplaintPageModel } from "../../src/models/complaint-page/complaint-page";
import { ComplaintPageVehicleDropzone } from "../../src/models/complaint-page/dropzones/complaint-page-vehicle-dropzone";
import { OKTrafficFormModel } from "../../src/models/traffic-form";
import { OKTrafficFormSchema } from "../../src/models/traffic-form-schema";
import { OKTrafficService } from "../../src/services/traffic";
import { createForm } from "../fixtures/form";

const schema = FormModel.getSchema<OKTrafficFormSchema>(OKTrafficFormModel);

describe("OKTrafficService", () => {
    // applyViolations/getAppliedViolations touch neither the value list service nor the dropzone helpers, so a
    // stub with no behavior is enough to construct the service
    const service = new OKTrafficService({} as IValueListService);
    let controllers: ControllerManager;

    beforeEach(async () => {
        controllers = new ControllerManager();
        controllers.loadForm(await createForm());
    });

    function getComplaintPage(): ComplaintPageModel {
        return controllers.getFormController().form.get<PageCollection>(schema.complaintPage).pages[0] as ComplaintPageModel;
    }

    describe("applyViolations", () => {
        /**
         * Both methods resolve the schema through `FormModel.getSchema`, which is keyed by the form model's own
         * constructor rather than the schema's -- passing the wrong one throws "Definition for entity type ... is
         * not registered" the instant either method runs. That is exactly the regression this guards.
         */
        it("resolves the schema and writes the chosen violation onto the form's first page", async () => {
            const violation: IViolation = { id: "speeding", code: "11-11-101", description: "Speeding", statute: "11-11-101" };

            await service.applyViolations(controllers, [violation], OKTrafficFormModel);

            const section = getComplaintPage().getViolationSection();
            expect(section.getMunicipalCode().getValue()).toBe("11-11-101");
            expect(section.getOffenseCode().getValue()).toBe("11-11-101");
        });

        it("does nothing when there are no violations to apply", async () => {
            await expect(service.applyViolations(controllers, [], OKTrafficFormModel)).resolves.toBeUndefined();
        });

        it("adds a page for each violation beyond the first, writing each onto its own page", async () => {
            const first: IViolation = { id: "speeding", code: "11-11-101", description: "Speeding", statute: "11-11-101" };
            const second: IViolation = { id: "reckless-driving", code: "11-11-102", description: "Reckless driving", statute: "11-11-102" };
            const third: IViolation = { id: "following-too-closely", code: "11-11-103", description: "Following too closely", statute: "11-11-103" };

            await service.applyViolations(controllers, [first, second, third], OKTrafficFormModel);

            const pages = controllers.getFormController().form.get<PageCollection>(schema.complaintPage).getPages<ComplaintPageModel>();

            expect(pages).toHaveLength(3);
            expect(pages[0].getViolationSection().getMunicipalCode().getValue()).toBe("11-11-101");
            expect(pages[1].getViolationSection().getMunicipalCode().getValue()).toBe("11-11-102");
            expect(pages[2].getViolationSection().getMunicipalCode().getValue()).toBe("11-11-103");
        });

        it("adds to the citation on a later call rather than overwriting the violation already on it", async () => {
            const first: IViolation = { id: "speeding", code: "11-11-101", description: "Speeding", statute: "11-11-101" };
            const second: IViolation = { id: "reckless-driving", code: "11-11-102", description: "Reckless driving", statute: "11-11-102" };

            await service.applyViolations(controllers, [first], OKTrafficFormModel);
            await service.applyViolations(controllers, [second], OKTrafficFormModel);

            const pages = controllers.getFormController().form.get<PageCollection>(schema.complaintPage).getPages<ComplaintPageModel>();

            expect(pages).toHaveLength(2);
            expect(pages[0].getViolationSection().getMunicipalCode().getValue()).toBe("11-11-101");
            expect(pages[1].getViolationSection().getMunicipalCode().getValue()).toBe("11-11-102");
        });
    });

    describe("getAppliedViolations", () => {
        it("resolves the schema without throwing", () => {
            expect(() => service.getAppliedViolations(controllers, [], OKTrafficFormModel)).not.toThrow();
        });

        it("narrows to the violations already carried on the form", async () => {
            const applied: IViolation = { id: "speeding", code: "11-11-101", description: "Speeding", statute: "11-11-101" };
            const notApplied: IViolation = { id: "reckless-driving", code: "11-11-102", description: "Reckless driving", statute: "11-11-102" };

            await service.applyViolations(controllers, [applied], OKTrafficFormModel);

            expect(service.getAppliedViolations(controllers, [applied, notApplied], OKTrafficFormModel)).toEqual([applied]);
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

            const dropzone = getComplaintPage().getDropzone(ComplaintPageVehicleDropzone)
                .onDrop({ make: "TOYOTA", model: "CAMRY", year: 2021 });

            const resolved = await new OKTrafficService(valueListService).resolveVehicleDropzone(dropzone);

            expect(resolved.getFields().make?.getValue()).toEqual({ value: "TOYT", description: "TOYOTA" });
            expect(resolved.getFields().model?.getValue()).toEqual({ value: "CAM", description: "CAMRY" });
        });

        it("clears make and model when the dropped name isn't found in either list", async () => {
            const valueListService: IValueListService = { findByDescription: vi.fn(async () => undefined) } as unknown as IValueListService;

            const dropzone = getComplaintPage().getDropzone(ComplaintPageVehicleDropzone)
                .onDrop({ make: "NOT A REAL MAKE", model: "NOT A REAL MODEL", year: 2021 });

            const resolved = await new OKTrafficService(valueListService).resolveVehicleDropzone(dropzone);

            expect(resolved.getFields().make?.getValue()).toEqual({ value: "", description: "" });
            expect(resolved.getFields().model?.getValue()).toEqual({ value: "", description: "" });
        });
    });
});

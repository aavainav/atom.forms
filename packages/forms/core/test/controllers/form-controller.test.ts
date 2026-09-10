import { beforeEach, describe, expect, it } from "vitest";

import { FormController } from "../../src/controllers/form-controller";
import type { OptionFieldModel } from "../../src/models/option-field";
import type { PageCollection } from "../../src/models/page-collection";
import type { StringFieldModel } from "../../src/models/string-field";
import type { SectionModel } from "../../src/models/section";
import {
    chargeFields,
    chargeSection,
    citationPage,
    createTestForm,
    TestCitationForm,
    violatorFields,
    violatorSection
} from "../fixtures/citation-form";

describe("FormController", () => {
    let controller: FormController<TestCitationForm>;

    beforeEach(async () => {
        controller = new FormController(await createTestForm());
    });

    /** Reads one field off every page of the citation, in page order. */
    function readAll<TField extends StringFieldModel | OptionFieldModel>(
        sectionDefinition: typeof violatorSection | typeof chargeSection,
        fieldDefinition: Parameters<SectionModel["get"]>[0]): Array<TField> {
        return controller.form
            .getPages()
            .map(page => page.get<SectionModel>(sectionDefinition).get<TField>(fieldDefinition));
    }

    function firstPageId(): string {
        return controller.form.getPages()[0].id!;
    }

    function setFirstName(value: string): void {
        controller
            .getPageBinding(citationPage, firstPageId())
            .getSection(violatorSection)
            .setValue(violatorFields.firstName, value);
    }

    describe("a shared section's binding", () => {
        /**
         * The update is run per page rather than one section being written into all of them, because every field
         * carries a uuid used as the DOM id of the input rendered for it and the pages print together.
         */
        it("fans a write out to every page while leaving each page its own field identities", async () => {
            await controller.addPage(citationPage);

            setFirstName("Dana");

            const fields = readAll<StringFieldModel>(violatorSection, violatorFields.firstName);

            expect(fields).toHaveLength(2);
            expect(fields.map(field => field.getValue())).toEqual(["Dana", "Dana"]);
            expect(new Set(fields.map(field => field.id)).size).toBe(2);
        });

        it("reads the same value whichever page's binding is asked", async () => {
            await controller.addPage(citationPage);
            setFirstName("Dana");

            const second = controller.form.getPages()[1];

            expect(controller.getPageBinding(citationPage, second.id!).getSection(violatorSection)
                .get().get<StringFieldModel>(violatorFields.firstName).getValue()).toBe("Dana");
        });

        it("leaves a section that is not shared alone on the other pages", async () => {
            await controller.addPage(citationPage);

            controller
                .getPageBinding(citationPage, firstPageId())
                .getSection(chargeSection)
                .setValue(chargeFields.offenseDescription, "Speeding");

            expect(readAll<StringFieldModel>(chargeSection, chargeFields.offenseDescription).map(field => field.getValue()))
                .toEqual(["Speeding", ""]);
        });
    });

    describe("addPage", () => {
        /** A page arrives from `createPage` empty, so without seeding it would show blank shared sections. */
        it("seeds a new page's shared sections from the first page, field by field", async () => {
            setFirstName("Dana");

            await controller.addPage(citationPage);

            const fields = readAll<StringFieldModel>(violatorSection, violatorFields.firstName);

            expect(fields.map(field => field.getValue())).toEqual(["Dana", "Dana"]);
            expect(fields[0].id).not.toBe(fields[1].id);
        });

        it("does not seed a section that is not shared", async () => {
            controller
                .getPageBinding(citationPage, firstPageId())
                .getSection(chargeSection)
                .setValue(chargeFields.offenseCode, { description: "Alpha", value: "A" });

            await controller.addPage(citationPage);

            const codes = readAll<OptionFieldModel>(chargeSection, chargeFields.offenseCode);

            expect(codes[0].getValue()).toEqual({ value: "A", description: "Alpha" });
            expect(codes[1].getValue()).toEqual({ value: "", description: "" });
        });

        it("appends the page to the collection", async () => {
            await controller.addPage(citationPage);

            expect(controller.form.get<PageCollection>(citationPage).pages).toHaveLength(2);
        });

        /**
         * Characterization, not specification. The seeding copies `isEnabled` across, but only for the shared
         * sections it copies at all -- so a page added to a read-only form arrives with its shared sections
         * correctly disabled and its own sections enabled.
         */
        it("carries the read-only state onto a new page's shared sections but not its own", async () => {
            controller.setForm(controller.form.setReadOnly());

            await controller.addPage(citationPage);

            const added = controller.form.getPages()[1];

            expect(added.get<SectionModel>(violatorSection)
                .get<StringFieldModel>(violatorFields.firstName).getIsEnabled()).toBe(false);
            expect(added.get<SectionModel>(chargeSection)
                .get<StringFieldModel>(chargeFields.offenseDescription).getIsEnabled()).toBe(true);
        });
    });

    describe("removePage", () => {
        it("removes the identified page and reports that it did", async () => {
            await controller.addPage(citationPage);
            const removed = controller.form.getPages()[0].id!;

            await expect(controller.removePage(citationPage, removed)).resolves.toBe(true);

            expect(controller.form.getPages()).toHaveLength(1);
            expect(controller.form.getPages()[0].id).not.toBe(removed);
        });

        it("reports false for a page it no longer holds", async () => {
            await expect(controller.removePage(citationPage, "not-a-page")).resolves.toBe(false);
        });

        it("leaves the page in place when the confirm policy declines", async () => {
            await controller.addPage(citationPage);
            controller.setConfirmDeletePage(async () => false);

            await expect(controller.removePage(citationPage, firstPageId())).resolves.toBe(false);

            expect(controller.form.getPages()).toHaveLength(2);
        });
    });

    describe("update", () => {
        it("publishes a new form and raises onChanged once", () => {
            const before = controller.form;
            let raised = 0;
            controller.onChanged(() => { raised += 1; });

            setFirstName("Dana");

            expect(controller.form).not.toBe(before);
            expect(raised).toBe(1);
        });

        /** The models are immutable, so an update that changed nothing returns the same instance and publishes nothing. */
        it("raises nothing when the update returns the form unchanged", () => {
            let raised = 0;
            controller.onChanged(() => { raised += 1; });

            controller.update(form => form);

            expect(raised).toBe(0);
        });
    });

    describe("getPageBinding", () => {
        it("hands back the same binding for the same page", () => {
            const id = firstPageId();

            expect(controller.getPageBinding(citationPage, id)).toBe(controller.getPageBinding(citationPage, id));
        });

        /** A binding addresses a page by id, so it survives other pages being added or removed around it. */
        it("still resolves its page after another page is added", async () => {
            const binding = controller.getPageBinding(citationPage, firstPageId());

            await controller.addPage(citationPage);

            expect(binding.get().id).toBe(firstPageId());
        });

        it("throws once its page is no longer on the form", async () => {
            await controller.addPage(citationPage);
            const id = firstPageId();
            const binding = controller.getPageBinding(citationPage, id);

            await controller.removePage(citationPage, id);

            expect(() => binding.get()).toThrowError(/is no longer part of citation/);
        });
    });
});

import { beforeEach, describe, expect, it } from "vitest";

import { ActivityEventArgs } from "../../src/controllers/controller-activity";
import { ControllerManager } from "../../src/controllers/controller-manager";
import type { IFormController } from "../../src/controllers/form-controller";
import type { OptionFieldModel } from "../../src/models/option-field";
import type { PageCollection } from "../../src/models/page-collection";
import { DefinitionFactory, defineFields } from "../../src/models/definition-factory";
import { FormModel } from "../../src/models/form";
import { PageModel } from "../../src/models/page";
import { SectionModel } from "../../src/models/section";
import { StringFieldModel } from "../../src/models/string-field";
import {
    chargeFields,
    chargeSection,
    citationPage,
    createTestForm,
    TestCitationForm,
    violatorFields,
    violatorSection
} from "../fixtures/citation-form";

/**
 * The smallest tree that exercises a section collection's binding: one page carrying three rows, each with a name
 * field of its own. A fixture of its own for the same reason `citation-form.ts` is -- its own subclasses, built
 * once at module scope.
 */
class TestRowsForm extends FormModel<any> { }
class TestRowsPage extends PageModel { }
class TestRowSection extends SectionModel { }

const rowsForm = DefinitionFactory.form("test-rows-form", TestRowsForm, {});
const rowsPage = DefinitionFactory.page("rows-page", rowsForm, TestRowsPage);
const rowsDefinition = DefinitionFactory.sectionCollection("rows", rowsPage, TestRowSection, 3);
const rowFields = defineFields(rowsDefinition, {
    name: { label: "Name", ctor: StringFieldModel }
});

function createRowsForm(): Promise<TestRowsForm> {
    return new TestRowsForm().initialize();
}

describe("FormController", () => {
    let controller: IFormController<TestCitationForm>;

    beforeEach(async () => {
        controller = new ControllerManager().loadForm(await createTestForm());
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

    /** Loads a form into a manager of its own, so what the manager relays can be watched. */
    async function watched() {
        const manager = new ControllerManager();
        const formController = manager.loadForm(await createTestForm());
        const relayed: Array<ActivityEventArgs> = [];
        manager.onActivity(args => relayed.push(args));

        return { formController, relayed };
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

    describe("a section collection's binding", () => {
        let rowsController: IFormController<TestRowsForm>;

        beforeEach(async () => {
            rowsController = new ControllerManager().loadForm(await createRowsForm());
        });

        function firstRowsPageId(): string {
            return rowsController.form.getPages()[0].id!;
        }

        function binding() {
            return rowsController.getPageBinding(rowsPage, firstRowsPageId()).getSectionCollection(rowsDefinition);
        }

        it("gets the collection with all of its rows", () => {
            expect(binding().get().getSections()).toHaveLength(3);
        });

        it("hands back the same binding for the same collection", () => {
            const pageBinding = rowsController.getPageBinding(rowsPage, firstRowsPageId());

            expect(pageBinding.getSectionCollection(rowsDefinition)).toBe(pageBinding.getSectionCollection(rowsDefinition));
        });

        it("hands back the same row binding for the same index", () => {
            expect(binding().getSection(1)).toBe(binding().getSection(1));
        });

        it("reads the row at the given index", () => {
            binding().getSection(1).setValue(rowFields.name, "Riley");

            expect(binding().getSection(1).get().get<StringFieldModel>(rowFields.name).getValue()).toBe("Riley");
        });

        it("writes to one row without disturbing the others", () => {
            binding().getSection(1).setValue(rowFields.name, "Riley");

            const names = binding().get().getSections().map(section => section.get<StringFieldModel>(rowFields.name).getValue());

            expect(names).toEqual(["", "Riley", ""]);
        });

        it("computes a row's update from its own current state, not a stale snapshot", () => {
            const row = binding().getSection(0);
            row.setValue(rowFields.name, "Dana");

            row.update({ update: section => section.set(rowFields.name, section.get<StringFieldModel>(rowFields.name).setValue(section.get<StringFieldModel>(rowFields.name).getValue() + " Lee")) });

            expect(row.get().get<StringFieldModel>(rowFields.name).getValue()).toBe("Dana Lee");
        });

        it("computes a collection update from its own current state", () => {
            binding().update({
                update: collection => collection.replace(2, collection.getSections()[2].set(rowFields.name, collection.getSections()[2].get<StringFieldModel>(rowFields.name).setValue("Sam")))
            });

            expect(binding().get().getSections()[2].get<StringFieldModel>(rowFields.name).getValue()).toBe("Sam");
        });

        it("relays a row's update reason through, the same as any other section binding", async () => {
            const manager = new ControllerManager();
            const formController = manager.loadForm(await createRowsForm());
            const relayed: Array<ActivityEventArgs> = [];
            manager.onActivity(args => relayed.push(args));
            const pageId = formController.form.getPages()[0].id!;

            formController.getPageBinding(rowsPage, pageId).getSectionCollection(rowsDefinition).getSection(0).update({
                update: section => section.set(rowFields.name, section.get<StringFieldModel>(rowFields.name).setValue("Dana")),
                reason: { kind: "dropped", type: "person" }
            });

            expect(relayed).toHaveLength(1);
            expect(relayed[0]).toMatchObject({ activity: { kind: "dropped", type: "person" } });
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
            controller.setForm(controller.form.setMode("viewable"));

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

    describe("page changes", () => {
        it("reports a page added, naming where it sits", async () => {
            const { formController, relayed } = await watched();

            await formController.addPage(citationPage);

            expect(relayed).toEqual([{ activity: { kind: "page-added", page: "citation", pageOrdinal: 1 }, form: formController.form }]);
        });

        it("reports a page removed, naming where it sat", async () => {
            const { formController, relayed } = await watched();
            await formController.addPage(citationPage);
            relayed.length = 0;

            await formController.removePage(citationPage, formController.form.getPages()[0].id!);

            expect(relayed).toEqual([{ activity: { kind: "page-removed", page: "citation", pageOrdinal: 0 }, form: formController.form }]);
        });

        it("reports nothing when the confirm policy declines the removal", async () => {
            const { formController, relayed } = await watched();
            await formController.addPage(citationPage);
            relayed.length = 0;
            formController.setConfirmDeletePage(async () => false);

            await formController.removePage(citationPage, formController.form.getPages()[0].id!);

            expect(relayed).toEqual([]);
        });

        it("reports nothing for a page it no longer holds", async () => {
            const { formController, relayed } = await watched();

            await formController.removePage(citationPage, "not-a-page");

            expect(relayed).toEqual([]);
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

            controller.update({ update: form => form });

            expect(raised).toBe(0);
        });
    });

    describe("an update that names what it was", () => {
        it("is relayed by the manager, with the form it produced", async () => {
            const { formController, relayed } = await watched();

            formController.update({ update: form => form.setStatus("issued"), reason: { kind: "dropped", type: "person" } });

            expect(relayed).toEqual([{ activity: { kind: "dropped", type: "person" }, form: formController.form }]);
        });

        it("is relayed when a section binding names it, since every edit goes through the form controller", async () => {
            const { formController, relayed } = await watched();
            const pageId = formController.form.getPages()[0].id!;

            formController.getPageBinding(citationPage, pageId).getSection(chargeSection).update({
                update: section => section.set(chargeFields.offenseDescription, section.get<StringFieldModel>(chargeFields.offenseDescription).setValue("Speeding")),
                reason: { kind: "dropped", type: "violation" }
            });

            expect(relayed).toHaveLength(1);
            expect(relayed[0]).toMatchObject({ activity: { kind: "dropped", type: "violation" } });
        });

        it("relays nothing for an update that names nothing", async () => {
            const { formController, relayed } = await watched();

            formController.update({ update: form => form.setStatus("issued") });

            expect(relayed).toEqual([]);
        });

        it("relays nothing when the update returns the form unchanged", async () => {
            const { formController, relayed } = await watched();

            formController.update({ update: form => form, reason: { kind: "dropped", type: "person" } });

            expect(relayed).toEqual([]);
        });
    });

    describe("a page binding's isSectionLocked", () => {
        it("says whether the form has locked the section", () => {
            controller.update({ update: form => form.lockSection(chargeSection) });
            const binding = controller.getPageBinding(citationPage, firstPageId());

            expect(binding.isSectionLocked(chargeSection)).toBe(true);
            expect(binding.isSectionLocked(violatorSection)).toBe(false);
        });

        it("follows the form, so a binding made before a lock reports it once it is applied", () => {
            const binding = controller.getPageBinding(citationPage, firstPageId());

            expect(binding.isSectionLocked(chargeSection)).toBe(false);

            controller.update({ update: form => form.lockSection(chargeSection) });

            expect(binding.isSectionLocked(chargeSection)).toBe(true);
        });
    });

    describe("a locked set of pages", () => {
        it("refuses a page to be added", async () => {
            controller.update({ update: form => form.lockPageSet(citationPage) });

            await expect(controller.addPage(citationPage)).rejects.toThrowError("cannot be added while they are locked");
            expect(controller.form.getPages()).toHaveLength(1);
        });

        it("refuses a page to be removed", async () => {
            await controller.addPage(citationPage);
            controller.update({ update: form => form.lockPageSet(citationPage) });

            await expect(controller.removePage(citationPage, firstPageId())).rejects.toThrowError("cannot be removed while they are locked");
            expect(controller.form.getPages()).toHaveLength(2);
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

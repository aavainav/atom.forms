import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ServicesContext } from "@common/react";
import { getAuditController } from "@forms/audit";
import { ControllerManager, FormModel } from "@forms/core";
import { IServiceCollection } from "@shrub/core";

import { PresetsPanel } from "../../src/components/panel/presets-panel";
import { IModalService } from "../../src/services/modal";
import { IPresetService, PresetService } from "../../src/services/preset";
import { IPresetSelectorService, PresetSelectorService } from "../../src/services/preset-selector";
import { IReportPreset, IReportViewerDataManager } from "../../src/services/report-viewer";
import { identity, populated, stubForm } from "../fixtures/preset-form";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const columbia: IReportPreset<any> = { data: { agencyCity: "Columbia", agencyName: "Columbia PD" }, id: "columbia-pd", readOnlyFields: { agencyName: true }, title: "Columbia PD" };
const twoPersons: IReportPreset<any> = { data: { persons: [{ first: "A" }, { first: "B" }] }, id: "two-persons", title: "Two persons" };
const twoUnits: IReportPreset<any> = { data: { units: [{}, {}] }, id: "two-units", title: "Two units" };
const mine: IReportPreset<any> = { data: { agencyCity: "Columbia" }, id: "mine", isPersonal: true, title: "My usual stop" };

interface IMountOptions {
    readonly answers?: Record<string, unknown>;
    readonly dataManager?: Partial<IReportViewerDataManager<any>>;
    readonly form?: FormModel<any>;
    readonly presets?: ReadonlyArray<IReportPreset<any>>;
}

const mounted: Array<() => void> = [];

/** Mounts the real panel over a stub form, against the real selector service and audit. */
function mount({ answers, dataManager, form = stubForm(answers), presets = [columbia, twoPersons, twoUnits, mine] }: IMountOptions = {}) {
    const controllers = new ControllerManager();
    controllers.loadForm(form);

    const selector = new PresetSelectorService();
    const showConfirmModal = vi.fn();
    const onError = vi.fn();
    const readPresets = vi.fn(async () => presets);
    const manager: IReportViewerDataManager<any> = { deletePreset: vi.fn(async () => undefined), read: async () => undefined, readPresets, writePreset: vi.fn(async () => undefined), ...dataManager };
    const registry = new Map<unknown, unknown>([[IModalService, { showConfirmModal }], [IPresetSelectorService, selector], [IPresetService, new PresetService()]]);
    const services = { get: (service: unknown) => registry.get(service) } as IServiceCollection;
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);

    act(() => root.render(createElement(ServicesContext.Provider, { value: services }, createElement(PresetsPanel, { controllers, dataManager: manager, onError }))));
    mounted.push(() => { act(() => root.unmount()); container.remove(); });

    const $ = <T extends HTMLElement>(selectors: string): T | null => container.querySelector<T>(selectors);
    const byId = (id: string): HTMLElement | null => container.querySelector<HTMLElement>(`[id="${id}"]`);
    const settle = async (): Promise<void> => { await act(async () => { await Promise.resolve(); await Promise.resolve(); }); };
    const open = async (): Promise<void> => { act(() => selector.openSelector()); await settle(); };
    const choose = (id: string): void => { act(() => byId(`preset-${id}`)!.click()); };
    const apply = async (): Promise<void> => { await act(async () => { $("#presets-apply-button")!.click(); }); await settle(); };
    const form$ = (): FormModel<any> => controllers.getFormController().form;
    const kinds = (): Array<string> => getAuditController(controllers).session.map(record => record.kind);

    return { $, apply, byId, choose, controllers, form$, kinds, manager, onError, open, readPresets, selector, settle, showConfirmModal };
}

/** Types into an input the way a user would; React ignores a value set straight on the element. */
function type(input: HTMLInputElement, value: string): void {
    const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;

    act(() => {
        setValue.call(input, value);
        input.dispatchEvent(new Event("input", { bubbles: true }));
    });
}

afterEach(() => {
    mounted.splice(0).forEach(unmount => unmount());
    document.body.innerHTML = "";
    populated.mockClear();
});

describe("PresetsPanel", () => {
    describe("opening", () => {
        it("is closed until it is asked to open, and reads no presets before then", () => {
            const { $, readPresets } = mount();

            expect($("#presets__offcanvas")!.classList.contains("show")).toBe(false);
            expect(readPresets).not.toHaveBeenCalled();
        });

        it("opens when the selector service asks it to, and reads the presets", async () => {
            const { $, open, readPresets } = mount();

            await open();

            expect($("#presets__offcanvas")!.classList.contains("show")).toBe(true);
            expect(readPresets).toHaveBeenCalledTimes(1);
        });

        it("reads the presets again each time it opens, so a list the host keeps changing is not stale", async () => {
            const { $, open, readPresets } = mount();

            await open();
            act(() => $<HTMLElement>(".btn-close")!.click());
            await open();

            expect(readPresets).toHaveBeenCalledTimes(2);
        });

        it("closes when the close button is pressed", async () => {
            const { $, open } = mount();
            await open();

            act(() => $<HTMLElement>(".btn-close")!.click());

            expect($("#presets__offcanvas")!.classList.contains("show")).toBe(false);
        });

        it("lists the presets the host gave, the user's own first", async () => {
            const { $, open } = mount();

            await open();

            expect(Array.from($("#preset-list")!.querySelectorAll("strong")).map(title => title.textContent)).toEqual(["My usual stop", "Columbia PD", "Two persons", "Two units"]);
        });

        it("says so, and lists nothing, when the presets cannot be read", async () => {
            const { $, onError, open } = mount({ dataManager: { readPresets: async () => { throw new Error("offline"); } } });

            await open();

            expect(onError).toHaveBeenCalledWith("The presets could not be loaded.");
            expect($("#preset-list")).toBeNull();
        });
    });

    describe("choosing a preset", () => {
        it("shows what it would do to the report as it stands", async () => {
            const { $, choose, open } = mount({ answers: { agencyCity: "Charleston" } });
            await open();

            choose("columbia-pd");

            const shown = Array.from($("#preset-preview")!.querySelectorAll(".list-group-item")).map(row => (row.textContent ?? "").replace(/\s+/g, " ").trim());
            expect(shown).toEqual(["Will set (1)", "agencyName", "Left alone (1)", "agencyCity Answered"]);
        });

        it("can apply only once one is chosen", async () => {
            const { $, choose, open } = mount();
            await open();
            expect($<HTMLButtonElement>("#presets-apply-button")!.disabled).toBe(true);

            choose("columbia-pd");

            expect($<HTMLButtonElement>("#presets-apply-button")!.disabled).toBe(false);
        });

        it("cannot apply a preset that would do nothing, and says so", async () => {
            const { $, choose, open } = mount({ answers: { agencyCity: "Columbia", agencyName: "Columbia PD" } });
            await open();

            choose("columbia-pd");

            expect($<HTMLButtonElement>("#presets-apply-button")!.disabled).toBe(true);
            expect($("#preset-preview-empty")).not.toBeNull();
        });

        it("can apply a preset that only adds pages, though it sets no field", async () => {
            const { $, choose, open } = mount({ answers: { units: [{}] } });
            await open();

            choose("two-units");

            expect($<HTMLButtonElement>("#presets-apply-button")!.disabled).toBe(false);
            expect($("#preset-preview")!.textContent).toContain("1 Units page");
        });

        it("follows what the officer does to the report while it is open", async () => {
            const { $, choose, controllers, open } = mount();
            await open();
            choose("columbia-pd");
            expect($("#preset-preview")!.textContent).toContain("agencyCity");

            act(() => controllers.getFormController().setForm(stubForm({ agencyCity: "Charleston" })));

            expect($("#preset-preview")!.textContent).toContain("agencyCity Answered");
        });
    });

    describe("applying", () => {
        it("writes what the preset sets into the report, with the report's own identity", async () => {
            const { apply, choose, form$, open } = mount();
            await open();
            choose("columbia-pd");

            await apply();

            expect(form$().extractData()).toMatchObject({ agencyCity: "Columbia", agencyName: "Columbia PD" });
            expect(populated).toHaveBeenCalledWith(expect.objectContaining({ data: { agencyCity: "Columbia", agencyName: "Columbia PD", ...identity } }));
        });

        it("writes over what the report answers when told to overwrite", async () => {
            const { $, apply, choose, form$, open } = mount({ answers: { agencyCity: "Charleston" } });
            await open();
            choose("columbia-pd");

            act(() => $<HTMLElement>("#presets-overwrite")!.click());
            await apply();

            expect(form$().extractData()).toMatchObject({ agencyCity: "Columbia" });
        });

    });

    describe("when applying goes wrong", () => {
        it("says so, and changes nothing, when populating fails", async () => {
            const failing = stubForm({}, undefined, async () => { throw new Error("Pages of units cannot be added while they are locked."); });
            const { apply, choose, form$, kinds, onError, open } = mount({ form: failing });
            await open();
            choose("columbia-pd");

            await apply();

            expect(onError).toHaveBeenCalledWith("Pages of units cannot be added while they are locked.");
            expect(form$()).toBe(failing);
            expect(kinds()).toEqual(["form-opened"]);
        });

        it("says so, and applies nothing, when the report changed while populating was awaited", async () => {
            let release: () => void = () => undefined;
            const slow = stubForm({}, undefined, () => new Promise(resolve => { release = () => resolve(stubForm({ agencyCity: "Columbia" })); }));
            const { $, byId, controllers, form$, kinds, onError, open } = mount({ form: slow });
            await open();
            act(() => byId("preset-columbia-pd")!.click());

            act(() => { $("#presets-apply-button")!.click(); });
            const edited = stubForm({ notes: "typed while it waited" });
            act(() => controllers.getFormController().setForm(edited));
            await act(async () => { release(); await Promise.resolve(); await Promise.resolve(); });

            expect(onError).toHaveBeenCalledWith("The report changed while the preset was being applied. Apply it again.");
            expect(form$()).toBe(edited);
            expect(kinds()).not.toContain("preset-applied");
        });

        it("cannot apply twice at once", async () => {
            let release: () => void = () => undefined;
            const slow = stubForm({}, undefined, () => new Promise(resolve => { release = () => resolve(stubForm({ agencyCity: "Columbia" })); }));
            const { $, byId, open } = mount({ form: slow });
            await open();
            act(() => byId("preset-columbia-pd")!.click());

            act(() => { $("#presets-apply-button")!.click(); });

            expect($<HTMLButtonElement>("#presets-apply-button")!.disabled).toBe(true);
            await act(async () => { release(); await Promise.resolve(); });
        });
    });

    describe("saving a preset", () => {
        const answers = { agencyCity: "Columbia", persons: [{ first: "Dana" }, { first: "Riley", type: "3" }] };

        it("is offered only when the host can keep one", async () => {
            const { $, open } = mount({ dataManager: { writePreset: undefined } });

            await open();

            expect($("#presets-save-button")).toBeNull();
        });

        it("opens a step to name it and choose what to keep, in place of the list", async () => {
            const { $, open } = mount({ answers });
            await open();

            act(() => $<HTMLElement>("#presets-save-button")!.click());

            expect($("#preset-title")).not.toBeNull();
            expect($("#preset-list")).toBeNull();
            expect($("#presets-apply-button")).toBeNull();
        });

        it("goes back to the list when the user cancels", async () => {
            const { $, open } = mount({ answers });
            await open();
            act(() => $<HTMLElement>("#presets-save-button")!.click());

            act(() => $<HTMLElement>("#preset-cancel-button")!.click());

            expect($("#preset-list")).not.toBeNull();
            expect($("#preset-title")).toBeNull();
        });

        it("goes back to the list, read again, with the new preset chosen", async () => {
            const { $, byId, open, readPresets } = mount({ answers });
            await open();
            act(() => $<HTMLElement>("#presets-save-button")!.click());
            type($<HTMLInputElement>("#preset-title")!, "Rileys page");
            act(() => byId("preset-field-persons[1].first")!.click());

            act(() => $<HTMLElement>("#preset-save-button")!.click());
            await act(async () => { await Promise.resolve(); await Promise.resolve(); });

            expect(readPresets).toHaveBeenCalledTimes(2);
            expect($("#preset-list")).not.toBeNull();
            expect($("#preset-title")).toBeNull();
        });

        it("chooses the preset it saved once the list holds it, so that what it would do is shown at once", async () => {
            const kept: Array<IReportPreset<any>> = [];
            const { $, byId, open } = mount({
                answers,
                dataManager: { readPresets: async () => [...kept, columbia], writePreset: async preset => { kept.push(preset); } }
            });
            await open();
            act(() => $<HTMLElement>("#presets-save-button")!.click());
            type($<HTMLInputElement>("#preset-title")!, "Rileys page");
            act(() => byId("preset-field-persons[1].first")!.click());

            act(() => $<HTMLElement>("#preset-save-button")!.click());
            await act(async () => { await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); });

            expect($(".list-group-item.active")!.textContent).toContain("Rileys page");
            // saved from this report, it has nothing left to do to it, which is what the preview of the chosen preset says
            expect($("#preset-preview-empty")).not.toBeNull();
        });

        it("says why, stays on the step, and records nothing, when the host refuses", async () => {
            const { $, byId, controllers, onError, open } = mount({ answers, dataManager: { writePreset: async () => { throw new Error("Presets may not hold a person's name."); } } });
            await open();
            act(() => $<HTMLElement>("#presets-save-button")!.click());
            type($<HTMLInputElement>("#preset-title")!, "Rileys page");
            act(() => byId("preset-field-persons[1].first")!.click());

            act(() => $<HTMLElement>("#preset-save-button")!.click());
            await act(async () => { await Promise.resolve(); await Promise.resolve(); });

            expect(onError).toHaveBeenCalledWith("Presets may not hold a person's name.");
            expect($("#preset-title")).not.toBeNull();
            expect(getAuditController(controllers).session.map(record => record.kind)).not.toContain("preset-saved");
        });
    });

    describe("the step a preset is saved from", () => {
        const answers = { agencyCity: "Columbia", agencyName: "Columbia PD", persons: [{ first: "Dana" }, { first: "Riley", type: "3" }] };

        /** Opens the step, and gives back what a test needs to work in it. */
        async function openStep() {
            const opened = mount({ answers });
            await opened.open();
            act(() => opened.$<HTMLElement>("#presets-save-button")!.click());

            const save = (): HTMLButtonElement => opened.$<HTMLButtonElement>("#preset-save-button")!;
            const hint = (): string => opened.$("#presets-save-hint")!.textContent ?? "";
            const name = (value: string): void => type(opened.$<HTMLInputElement>("#preset-title")!, value);
            const tickEverything = (): void => {
                ["preset-all-The report", "preset-all-Persons, page 1", "preset-all-Persons, page 2"].forEach(id => act(() => opened.byId(id)!.click()));
            };

            return { ...opened, hint, name, save, tickEverything };
        }

        it("keeps Save disabled, and says the preset needs a name, however much is ticked -- the name is what is easy to miss on a long list", async () => {
            const { hint, name, save, tickEverything } = await openStep();

            tickEverything();

            expect(save().disabled).toBe(true);
            expect(hint()).toBe("Name the preset to save it.");

            name("Everything");

            expect(save().disabled).toBe(false);
            // the report's two fields, one on the first page of persons and two on the second
            expect(hint()).toBe("5 to keep");
        });

        it("says something must be ticked when it is named and nothing is", async () => {
            const { hint, name, save } = await openStep();

            name("My stop");

            expect(save().disabled).toBe(true);
            expect(hint()).toBe("Tick what to keep.");
        });

        it("counts what it will keep beside Save as it is ticked, the number of pages of a list included", async () => {
            const { byId, hint, name } = await openStep();
            name("My stop");

            act(() => byId("preset-field-agencyCity")!.click());
            expect(hint()).toBe("1 to keep");

            act(() => byId("preset-pages-persons")!.click());
            expect(hint()).toBe("2 to keep");

            act(() => byId("preset-field-agencyCity")!.click());
            expect(hint()).toBe("1 to keep");
        });

        it("keeps the actions in the footer, outside the list they follow, so they can be reached without scrolling it", async () => {
            const { $, byId, name, save } = await openStep();
            act(() => byId("preset-field-agencyCity")!.click());
            name("My stop");

            expect(save().closest(".offcanvas-body")).toBeNull();
            expect(save().closest(".f-offcanvas__footer")).not.toBeNull();
            expect($<HTMLElement>("#preset-cancel-button")!.closest(".f-offcanvas__footer")).not.toBeNull();
            expect($("#preset-title")!.closest(".offcanvas-body")).not.toBeNull();
        });

        it("saves what is ticked when Save is pressed in the footer", async () => {
            const { $, byId, manager, name, save } = await openStep();
            name("Everything on Rileys page");
            act(() => byId("preset-all-Persons, page 2")!.click());

            act(() => save().click());
            await act(async () => { await Promise.resolve(); await Promise.resolve(); });

            expect(manager.writePreset).toHaveBeenCalledWith({ data: { persons: [{}, { first: "Riley", type: "3" }] }, id: expect.any(String), isPersonal: true, title: "Everything on Rileys page" });
            expect($("#preset-title")).toBeNull();
        });

        it("starts empty each time it is opened, whatever was ticked and named before", async () => {
            const { $, byId, hint, name } = await openStep();
            name("My stop");
            act(() => byId("preset-field-agencyCity")!.click());

            act(() => $<HTMLElement>("#preset-cancel-button")!.click());
            act(() => $<HTMLElement>("#presets-save-button")!.click());

            expect($<HTMLInputElement>("#preset-title")!.value).toBe("");
            expect(document.querySelectorAll("[id=\"preset-field-agencyCity\"] input:checked")).toHaveLength(0);
            expect(hint()).toBe("Name the preset to save it.");
        });

        it("puts the cursor in the name box when it opens", async () => {
            const { $ } = await openStep();

            expect(document.activeElement).toBe($("#preset-title"));
        });

        it("has no hint, and no footer of its own, while the list is showing", async () => {
            const { $, open } = mount({ answers });
            await open();

            expect($("#presets-save-hint")).toBeNull();
            expect($("#preset-save-button")).toBeNull();
        });
    });

    describe("deleting a preset", () => {
        it("is offered for a preset the user saved, and not for the host's", async () => {
            const { $, choose, open } = mount();
            await open();

            choose("columbia-pd");
            expect($("#presets-delete-button")).toBeNull();

            choose("mine");
            expect($("#presets-delete-button")).not.toBeNull();
        });

        it("is not offered when the host cannot delete one", async () => {
            const { $, choose, open } = mount({ dataManager: { deletePreset: undefined } });
            await open();

            choose("mine");

            expect($("#presets-delete-button")).toBeNull();
        });

        it("asks first, and deletes nothing until it is confirmed", async () => {
            const { $, choose, manager, open, showConfirmModal } = mount();
            await open();
            choose("mine");

            act(() => $<HTMLElement>("#presets-delete-button")!.click());

            expect(showConfirmModal).toHaveBeenCalledTimes(1);
            expect(showConfirmModal.mock.calls[0][0]).toMatchObject({ confirmText: "Delete", title: "Delete this preset?" });
            expect(manager.deletePreset).not.toHaveBeenCalled();
        });

        it("deletes it, records that it did, reads the list again, and chooses nothing, once confirmed", async () => {
            const { $, choose, manager, open, readPresets, showConfirmModal } = mount();
            await open();
            choose("mine");
            act(() => $<HTMLElement>("#presets-delete-button")!.click());

            await act(async () => { await showConfirmModal.mock.calls[0][0].onConfirm(); });

            expect(manager.deletePreset).toHaveBeenCalledWith("mine");
            expect(readPresets).toHaveBeenCalledTimes(2);
            expect($("#preset-preview")).toBeNull();
        });

        it("deletes nothing when it is cancelled", async () => {
            const { $, choose, manager, open, showConfirmModal } = mount();
            await open();
            choose("mine");
            act(() => $<HTMLElement>("#presets-delete-button")!.click());

            await act(async () => { await showConfirmModal.mock.calls[0][0].onCancel(); });

            expect(manager.deletePreset).not.toHaveBeenCalled();
        });

        it("says why, and records nothing, when the host cannot delete it", async () => {
            const { $, choose, onError, open, showConfirmModal } = mount({ dataManager: { deletePreset: async () => { throw new Error("offline"); } } });
            await open();
            choose("mine");
            act(() => $<HTMLElement>("#presets-delete-button")!.click());

            await act(async () => { await showConfirmModal.mock.calls[0][0].onConfirm(); });

            expect(onError).toHaveBeenCalledWith("offline");
        });
    });
});

import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import { IReportData } from "@forms/core";

import { ISaveRequest, PresetSaveForm } from "../../src/components/panel/preset-save-form";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/** A report as it stands: its identity, and whatever else has been answered. */
function report(answers: Record<string, unknown> = {}): IReportData {
    return { id: "report-1", name: "Stub Form", revision: 3, status: "draft", type: "none", version: "1.0", ...answers };
}

const answers = {
    agencyCity: "Columbia",
    agencyName: "Columbia PD",
    isCommercial: true,
    persons: [{ first: "Dana", last: "Okafor" }, { first: "Riley", type: { description: "NON-MOTORIST", value: "3" } }],
    units: [{ number: "1" }, { number: "2" }]
};

interface IMountOptions {
    readonly current?: IReportData;
    readonly locked?: object;
    readonly onCancel?: () => void;
    readonly onSave?: (request: ISaveRequest) => void;
}

const mounted: Array<() => void> = [];

function mount({ current = report(answers), locked, onCancel = () => undefined, onSave = () => undefined }: IMountOptions = {}): HTMLElement {
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);

    act(() => root.render(createElement(PresetSaveForm, { current, locked: locked as never, onCancel, onSave })));
    mounted.push(() => { act(() => root.unmount()); container.remove(); });

    return container;
}

/** The row with the id. An id can hold a path such as `persons[1].first`, which a selector cannot spell. */
const row = (container: HTMLElement, id: string): HTMLElement | null => container.querySelector<HTMLElement>(`[id="${id}"]`);

const tick = (container: HTMLElement, id: string): void => { act(() => row(container, id)!.click()); };

const isTicked = (container: HTMLElement, id: string): boolean => row(container, id)!.querySelector<HTMLInputElement>("input")!.checked;

/** Types into the name box the way a user would; React ignores a value set straight on the element. */
function name(container: HTMLElement, value: string): void {
    const input = container.querySelector<HTMLInputElement>("#preset-title")!;
    const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;

    act(() => {
        setValue.call(input, value);
        input.dispatchEvent(new Event("input", { bubbles: true }));
    });
}

const saveButton = (container: HTMLElement): HTMLButtonElement => container.querySelector<HTMLButtonElement>("#preset-save-button")!;

afterEach(() => {
    mounted.splice(0).forEach(unmount => unmount());
});

describe("PresetSaveForm", () => {
    describe("what it offers", () => {
        it("groups the fields by where they sit: the report's own, then each page of each list", () => {
            const container = mount();

            expect(Array.from(container.querySelectorAll(".list-group-item.text-uppercase")).map(heading => heading.textContent)).toEqual([
                "Pages", "The report", "Persons, page 1", "Persons, page 2", "Units, page 1", "Units, page 2"
            ]);
        });

        it("shows each field by its name and what it holds, an option box by its description and a box by yes", () => {
            const container = mount();

            expect(row(container, "preset-field-agencyCity")!.textContent).toContain("Agency City: Columbia");
            expect(row(container, "preset-field-isCommercial")!.textContent).toContain("Is Commercial: Yes");
            expect(row(container, "preset-field-persons[1].type")!.textContent).toContain("Type: NON-MOTORIST");
        });

        it("offers no field the host locked, on the report or on a page", () => {
            const container = mount({ locked: { agencyName: true, persons: [{ first: true }, {}] } });

            expect(row(container, "preset-field-agencyName")).toBeNull();
            expect(row(container, "preset-field-persons[0].first")).toBeNull();
            expect(row(container, "preset-field-persons[0].last")).not.toBeNull();
            expect(row(container, "preset-field-persons[1].first")).not.toBeNull();
        });

        it("offers nothing of the report's own identity", () => {
            const container = mount();

            ["id", "name", "revision", "status", "type", "version"].forEach(key => expect(row(container, `preset-field-${key}`)).toBeNull());
        });

        it("offers to keep the number of pages of each list, saying how many it holds", () => {
            const container = mount();

            expect(row(container, "preset-pages-persons")!.textContent).toContain("Keep 2 Persons pages, blank");
            expect(row(container, "preset-pages-units")!.textContent).toContain("Keep 2 Units pages, blank");
        });

        it("says a list of one holds one page", () => {
            expect(row(mount({ current: report({ units: [{ number: "1" }] }) }), "preset-pages-units")!.textContent).toContain("Keep 1 Units page, blank");
        });

        it("offers no pages, and no heading for them, when the report has none", () => {
            const container = mount({ current: report({ agencyCity: "Columbia" }) });

            expect(container.querySelector("#preset-pages")).toBeNull();
        });

        it("has nothing ticked to begin with", () => {
            const container = mount();

            expect(container.querySelectorAll("input:checked")).toHaveLength(0);
        });
    });

    describe("ticking", () => {
        it("ticks a field when its row is clicked, and unticks it when it is clicked again", () => {
            const container = mount();

            tick(container, "preset-field-agencyCity");
            expect(isTicked(container, "preset-field-agencyCity")).toBe(true);

            tick(container, "preset-field-agencyCity");
            expect(isTicked(container, "preset-field-agencyCity")).toBe(false);
        });

        it("ticks every field on a page with the row for everything there, and no field of another", () => {
            const container = mount();

            tick(container, "preset-all-Persons, page 1");

            expect(isTicked(container, "preset-field-persons[0].first")).toBe(true);
            expect(isTicked(container, "preset-field-persons[0].last")).toBe(true);
            expect(isTicked(container, "preset-field-persons[1].first")).toBe(false);
            expect(isTicked(container, "preset-field-agencyCity")).toBe(false);
        });

        it("unticks every field on the page when everything there is unticked", () => {
            const container = mount();

            tick(container, "preset-all-Persons, page 1");
            tick(container, "preset-all-Persons, page 1");

            expect(container.querySelectorAll("input:checked")).toHaveLength(0);
        });

        it("shows everything there as ticked once every field on the page is, and as partly ticked while some are", () => {
            const container = mount();
            const all = "preset-all-Persons, page 1";

            tick(container, "preset-field-persons[0].first");
            expect(row(container, all)!.querySelector<HTMLInputElement>("input")!.indeterminate).toBe(true);
            expect(isTicked(container, all)).toBe(false);

            tick(container, "preset-field-persons[0].last");
            expect(isTicked(container, all)).toBe(true);
        });

        it("ticks the number of pages of a list on its own", () => {
            const container = mount();

            tick(container, "preset-pages-units");

            expect(isTicked(container, "preset-pages-units")).toBe(true);
            expect(isTicked(container, "preset-pages-persons")).toBe(false);
        });
    });

    describe("saving", () => {
        it("cannot save until it is named and something is ticked", () => {
            const container = mount();
            expect(saveButton(container).disabled).toBe(true);

            name(container, "My stop");
            expect(saveButton(container).disabled).toBe(true);

            tick(container, "preset-field-agencyCity");
            expect(saveButton(container).disabled).toBe(false);
        });

        it("cannot save when something is ticked but it has no name, or only blanks for one", () => {
            const container = mount();

            tick(container, "preset-field-agencyCity");
            expect(saveButton(container).disabled).toBe(true);

            name(container, "   ");
            expect(saveButton(container).disabled).toBe(true);
        });

        it("can save the number of pages alone, with nothing else ticked", () => {
            const container = mount();

            name(container, "Two units");
            tick(container, "preset-pages-units");

            expect(saveButton(container).disabled).toBe(false);
        });

        it("says what was ticked, and what it was named without the spaces round it", () => {
            const onSave = vi.fn();
            const container = mount({ onSave });

            name(container, "  My stop  ");
            tick(container, "preset-field-agencyCity");
            tick(container, "preset-field-persons[1].type");
            tick(container, "preset-pages-units");
            act(() => saveButton(container).click());

            expect(onSave).toHaveBeenCalledTimes(1);
            const request = onSave.mock.calls[0][0] as ISaveRequest;

            expect(request.title).toBe("My stop");
            expect([...request.selected]).toEqual(["agencyCity", "persons[1].type"]);
            expect([...request.pageCounts]).toEqual(["units"]);
        });

        it("does not say anything when it is not ready to save", () => {
            const onSave = vi.fn();
            const container = mount({ onSave });

            act(() => saveButton(container).click());

            expect(onSave).not.toHaveBeenCalled();
        });
    });

    it("says the user went back, without saving, when Cancel is pressed", () => {
        const onCancel = vi.fn();
        const onSave = vi.fn();
        const container = mount({ onCancel, onSave });

        act(() => container.querySelector<HTMLButtonElement>("#preset-cancel-button")!.click());

        expect(onCancel).toHaveBeenCalledTimes(1);
        expect(onSave).not.toHaveBeenCalled();
    });

    it("offers nothing to tick for a report with nothing answered", () => {
        const container = mount({ current: report() });

        expect(container.querySelectorAll(".list-group-item.text-uppercase")).toHaveLength(0);
        expect(saveButton(container).disabled).toBe(true);
    });
});

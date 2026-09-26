import { act, createElement, useState } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import { IReportData } from "@forms/core";

import { emptySaveRequest, getSaveBlocker, ISaveRequest, PresetSaveForm } from "../../src/components/panel/preset-save-form";

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
    readonly initial?: ISaveRequest;
    readonly locked?: object;
    readonly onChange?: (value: ISaveRequest) => void;
}

const mounted: Array<() => void> = [];

/** Holds what the user has chosen, as the panel does, so that the form shows what it is told. */
function Harness({ current, initial, locked, onChange }: Required<Omit<IMountOptions, "locked">> & { readonly locked?: object }): React.JSX.Element {
    const [value, setValue] = useState(initial);

    return createElement(PresetSaveForm, { current, locked: locked as never, value, onChange: next => { setValue(next); onChange(next); } });
}

function mount({ current = report(answers), initial = emptySaveRequest, locked, onChange = () => undefined }: IMountOptions = {}): HTMLElement {
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);

    act(() => root.render(createElement(Harness, { current, initial, locked, onChange })));
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

        it("offers nothing to tick for a report with nothing answered", () => {
            expect(mount({ current: report() }).querySelectorAll(".list-group-item.text-uppercase")).toHaveLength(0);
        });

        it("has nothing ticked, and no name, to begin with", () => {
            const container = mount();

            expect(container.querySelectorAll("input:checked")).toHaveLength(0);
            expect(container.querySelector<HTMLInputElement>("#preset-title")!.value).toBe("");
        });

        it("puts the cursor in the name box, since a preset cannot be saved without one", () => {
            const container = mount();

            expect(document.activeElement).toBe(container.querySelector("#preset-title"));
        });
    });

    describe("what it shows of what it is given", () => {
        it("shows the name it is given", () => {
            expect(mount({ initial: { ...emptySaveRequest, title: "My stop" } }).querySelector<HTMLInputElement>("#preset-title")!.value).toBe("My stop");
        });

        it("shows a field ticked that it is given as ticked, and the number of pages of a list", () => {
            const container = mount({ initial: { pageCounts: new Set(["units"]), selected: new Set(["agencyCity"]), title: "" } });

            expect(isTicked(container, "preset-field-agencyCity")).toBe(true);
            expect(isTicked(container, "preset-field-agencyName")).toBe(false);
            expect(isTicked(container, "preset-pages-units")).toBe(true);
            expect(isTicked(container, "preset-pages-persons")).toBe(false);
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

    describe("what it says was chosen", () => {
        it("says the name, as it is typed, keeping what was ticked", () => {
            const onChange = vi.fn();
            const container = mount({ onChange });

            tick(container, "preset-field-agencyCity");
            name(container, "My stop");

            const last = onChange.mock.calls.at(-1)![0] as ISaveRequest;
            expect(last.title).toBe("My stop");
            expect([...last.selected]).toEqual(["agencyCity"]);
        });

        it("says what was ticked, by path, keeping the name and the pages kept", () => {
            const onChange = vi.fn();
            const container = mount({ onChange });

            name(container, "My stop");
            tick(container, "preset-field-agencyCity");
            tick(container, "preset-field-persons[1].type");
            tick(container, "preset-pages-units");

            const last = onChange.mock.calls.at(-1)![0] as ISaveRequest;
            expect(last.title).toBe("My stop");
            expect([...last.selected]).toEqual(["agencyCity", "persons[1].type"]);
            expect([...last.pageCounts]).toEqual(["units"]);
        });

        it("says every field on a page when everything there is ticked", () => {
            const onChange = vi.fn();
            const container = mount({ onChange });

            tick(container, "preset-all-Persons, page 1");

            expect([...(onChange.mock.calls.at(-1)![0] as ISaveRequest).selected]).toEqual(["persons[0].first", "persons[0].last"]);
        });

        it("does not change what it was given, which is the caller's to hold", () => {
            const initial: ISaveRequest = { pageCounts: new Set(), selected: new Set(["agencyCity"]), title: "" };
            const container = mount({ initial });

            tick(container, "preset-field-agencyName");

            expect([...initial.selected]).toEqual(["agencyCity"]);
        });
    });
});

describe("emptySaveRequest", () => {
    it("has no name, and nothing ticked", () => {
        expect(emptySaveRequest.title).toBe("");
        expect(emptySaveRequest.selected.size).toBe(0);
        expect(emptySaveRequest.pageCounts.size).toBe(0);
    });
});

describe("getSaveBlocker", () => {
    const named = { ...emptySaveRequest, title: "My stop" };

    it("says a preset needs a name when it has none, whatever is ticked, since that is what the user has not seen", () => {
        expect(getSaveBlocker(emptySaveRequest)).toBe("Name the preset to save it.");
        expect(getSaveBlocker({ ...emptySaveRequest, selected: new Set(["agencyCity"]) })).toBe("Name the preset to save it.");
    });

    it("counts a name of blanks as none", () => {
        expect(getSaveBlocker({ ...emptySaveRequest, selected: new Set(["agencyCity"]), title: "   " })).toBe("Name the preset to save it.");
    });

    it("says something must be ticked when it is named and nothing is", () => {
        expect(getSaveBlocker(named)).toBe("Tick what to keep.");
    });

    it("says nothing is in the way once it is named and a field is ticked", () => {
        expect(getSaveBlocker({ ...named, selected: new Set(["agencyCity"]) })).toBeUndefined();
    });

    it("counts the number of pages of a list as something to keep, with nothing else ticked", () => {
        expect(getSaveBlocker({ ...named, pageCounts: new Set(["units"]) })).toBeUndefined();
    });
});

import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PresetList } from "../../src/components/panel/preset-list";
import { IReportPreset } from "../../src/services/report-viewer";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const mine: IReportPreset<any> = { data: {}, id: "mine", isPersonal: true, title: "My usual stop" };
const plain: IReportPreset<any> = { data: {}, id: "plain", title: "Plain" };
const wet: IReportPreset<any> = { data: {}, description: "Rain, wet road, daylight.", group: "Conditions", id: "wet", title: "Wet road" };
const court: IReportPreset<any> = { data: {}, group: "Agency", id: "court", title: "Columbia court" };
const dry: IReportPreset<any> = { data: {}, group: "Conditions", id: "dry", title: "Dry road" };

interface IMountOptions {
    readonly onSelect?: (id: string) => void;
    readonly presets?: ReadonlyArray<IReportPreset<any>>;
    readonly selected?: string;
}

const mounted: Array<() => void> = [];

function mount({ onSelect = () => undefined, presets = [mine, plain, wet, court, dry], selected }: IMountOptions = {}): HTMLElement {
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);

    act(() => root.render(createElement(PresetList, { onSelect, presets, selected })));
    mounted.push(() => { act(() => root.unmount()); container.remove(); });

    return container;
}

/** The titles of the rows and headings, in the order they are listed. */
function listed(container: HTMLElement): Array<string | null | undefined> {
    return Array.from(container.querySelectorAll(".list-group-item")).map(row => row.querySelector("strong")?.textContent ?? row.textContent);
}

/** Types into the search box the way a user would; React ignores a value set straight on the element. */
function search(container: HTMLElement, term: string): void {
    const input = container.querySelector<HTMLInputElement>("#preset-search")!;
    const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;

    act(() => {
        setValue.call(input, term);
        input.dispatchEvent(new Event("input", { bubbles: true }));
    });
}

afterEach(() => {
    mounted.splice(0).forEach(unmount => unmount());
});

describe("PresetList", () => {
    it("lists the user's own presets first, under their own heading, then those with no group, then each group in the order the host gave it", () => {
        expect(listed(mount())).toEqual(["My presets", "My usual stop", "Plain", "Conditions", "Wet road", "Dry road", "Agency", "Columbia court"]);
    });

    it("gives no heading to presets that have no group", () => {
        expect(listed(mount({ presets: [plain] }))).toEqual(["Plain"]);
    });

    it("says a little more about a preset that has something to say, and only that one", () => {
        const container = mount();

        expect(container.querySelector("#preset-wet")!.textContent).toContain("Rain, wet road, daylight.");
        expect(container.querySelector("#preset-plain")!.querySelectorAll("small")).toHaveLength(0);
    });

    it("marks the preset chosen, and only that one", () => {
        const container = mount({ selected: "wet" });

        expect(container.querySelectorAll(".active")).toHaveLength(1);
        expect(container.querySelector(".active")!.id).toBe("preset-wet");
    });

    it("marks none when none is chosen", () => {
        expect(mount().querySelectorAll(".active")).toHaveLength(0);
    });

    it("says which preset was chosen when one is clicked", () => {
        const onSelect = vi.fn();
        const container = mount({ onSelect });

        act(() => container.querySelector<HTMLElement>("#preset-court")!.click());

        expect(onSelect).toHaveBeenCalledWith("court");
    });

    describe("searching", () => {
        it("narrows the list to the presets whose title holds the term, whatever its case", () => {
            const container = mount();

            search(container, "DRY");

            expect(listed(container)).toEqual(["Conditions", "Dry road"]);
        });

        it("finds a preset by its description", () => {
            const container = mount();

            search(container, "rain");

            expect(listed(container)).toEqual(["Conditions", "Wet road"]);
        });

        it("finds a preset by its group", () => {
            const container = mount();

            search(container, "agency");

            expect(listed(container)).toEqual(["Agency", "Columbia court"]);
        });

        it("says so when nothing matches, and offers no list", () => {
            const container = mount();

            search(container, "zebra");

            expect(container.querySelector("#preset-list-no-match")).not.toBeNull();
            expect(container.querySelector("#preset-list")).toBeNull();
        });

        it("brings the whole list back when the term is cleared", () => {
            const container = mount();

            search(container, "dry");
            search(container, "");

            expect(listed(container)).toHaveLength(8);
        });
    });

    it("says there are none yet, rather than that nothing matches, when there are no presets", () => {
        const container = mount({ presets: [] });

        expect(container.querySelector("#preset-list-empty")!.textContent).toContain("No presets yet");
        expect(container.querySelector("#preset-list-no-match")).toBeNull();
    });
});

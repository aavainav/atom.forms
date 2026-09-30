import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import { IFormVariant } from "@forms/core";

import { TemplatePicker, ITemplateChoice } from "../../src/components/options/template-picker";
import { IReportTemplate } from "../../src/services/report-viewer";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const speeding: IReportTemplate = { description: "Fifteen over the limit.", id: "speeding", title: "Speeding, 15 over" };
const stopSign: IReportTemplate = { id: "stop-sign", title: "Stop sign" };
const collision: IReportTemplate = { group: "Collisions", id: "collision", title: "Two-vehicle collision" };
const rollover: IReportTemplate = { group: "Collisions", id: "rollover", title: "Rollover" };
const standard: IReportTemplate = { id: "standard", isDefault: true, title: "Standard" };

const court: IFormVariant = { description: "The front page and notice page.", id: "court", title: "Court" };
const trial: IFormVariant = { id: "trial", title: "Trial" };

interface IMountOptions {
    readonly baseTemplate?: string;
    readonly includeBlank?: boolean;
    readonly onChange?: (choice: ITemplateChoice) => void;
    readonly selected?: ITemplateChoice;
    readonly templates?: ReadonlyArray<IReportTemplate>;
    readonly variants?: ReadonlyArray<IFormVariant>;
}

const mounted: Array<() => void> = [];

function mount({ baseTemplate, includeBlank = true, onChange = () => undefined, selected = {}, templates = [speeding, stopSign], variants = [] }: IMountOptions = {}): HTMLElement {
    const container = document.createElement("div");
    const root = createRoot(container);

    act(() => root.render(createElement(TemplatePicker, { baseTemplate, includeBlank, onChange, selected, templates, variants })));
    mounted.push(() => act(() => root.unmount()));

    return container;
}

/** The titles of the rows and headings, in the order they are listed. */
function listed(container: HTMLElement): Array<string | null | undefined> {
    return Array.from(container.querySelectorAll(".list-group-item")).map(row => row.querySelector("strong")?.textContent ?? row.textContent);
}

function row(container: HTMLElement, title: string): HTMLElement {
    return Array.from(container.querySelectorAll<HTMLElement>(".list-group-item")).find(entry => entry.textContent?.includes(title))!;
}

afterEach(() => {
    mounted.splice(0).forEach(unmount => unmount());
});

describe("TemplatePicker", () => {
    it("lists the form's own default first, as Blank, and then the host's templates in the order given", () => {
        expect(listed(mount())).toEqual(["Blank", "Speeding, 15 over", "Stop sign"]);
    });

    it("leaves Blank out when told the host has a default of its own", () => {
        expect(listed(mount({ includeBlank: false, templates: [standard, speeding] }))).toEqual(["Standard", "Speeding, 15 over"]);
    });

    it("says a little more about a template that has something to say, and only that one", () => {
        const container = mount();

        expect(row(container, "Speeding, 15 over").textContent).toContain("Fifteen over the limit.");
        expect(row(container, "Stop sign").querySelectorAll("small")).toHaveLength(0);
    });

    it("lists those with no group first, and then each group under its heading, in the order the host gave them", () => {
        const container = mount({ templates: [collision, speeding, rollover] });

        expect(listed(container)).toEqual(["Blank", "Speeding, 15 over", "Collisions", "Two-vehicle collision", "Rollover"]);
        expect(container.querySelectorAll(".list-group-item-action")).toHaveLength(4);
    });

    it("keeps to one list, with no Templates heading, when the form has no blank forms of its own", () => {
        const container = mount();

        expect(container.querySelectorAll(".list-group")).toHaveLength(1);
        expect(container.textContent).not.toMatch(/Templates/);
    });

    it("gives no heading to templates that have no group", () => {
        expect(mount().textContent).not.toMatch(/Collisions/);
        expect(mount().querySelectorAll(".text-uppercase")).toHaveLength(0);
    });

    it("has Blank selected to begin with when nothing else is", () => {
        const container = mount();

        expect(container.querySelector(".active")!.textContent).toContain("Blank");
        expect(container.querySelectorAll(".active")).toHaveLength(1);
    });

    it("has the template it is told is selected selected to begin with", () => {
        const container = mount({ selected: { template: "stop-sign" } });

        expect(container.querySelector(".active")!.textContent).toContain("Stop sign");
        expect(container.querySelectorAll(".active")).toHaveLength(1);
    });

    it("selects the template clicked, and says which it was", () => {
        const onChange = vi.fn();
        const container = mount({ onChange });

        act(() => row(container, "Speeding, 15 over").click());

        expect(onChange).toHaveBeenCalledWith({ template: "speeding" });
        expect(container.querySelector(".active")!.textContent).toContain("Speeding, 15 over");
        expect(container.querySelectorAll(".active")).toHaveLength(1);
    });

    it("says no template was chosen when Blank is, since the form's own default has no id", () => {
        const onChange = vi.fn();
        const container = mount({ onChange, selected: { template: "speeding" } });

        act(() => row(container, "Blank").click());

        expect(onChange).toHaveBeenCalledWith({});
        expect(container.querySelector(".active")!.textContent).toContain("Blank");
    });

    describe("with blank forms of the form's own", () => {
        it("lists them first, in a list of their own, in place of Blank, and the templates in another under their own heading", () => {
            const container = mount({ includeBlank: false, templates: [collision, speeding], variants: [court, trial] });
            const [blankForms, templates] = Array.from(container.querySelectorAll<HTMLElement>(".list-group"));

            expect(container.querySelectorAll(".list-group")).toHaveLength(2);
            expect(listed(blankForms)).toEqual(["Blank forms", "Court", "Trial"]);
            expect(listed(templates)).toEqual(["Templates", "Speeding, 15 over", "Collisions", "Two-vehicle collision"]);
            expect(row(container, "Court").textContent).toContain("The front page and notice page.");
        });

        it("draws no list of templates when the host offers none", () => {
            const container = mount({ includeBlank: false, templates: [], variants: [court, trial] });

            expect(container.querySelectorAll(".list-group")).toHaveLength(1);
            expect(container.textContent).not.toMatch(/Templates/);
        });

        it("has the blank form it is told is selected selected to begin with", () => {
            const container = mount({ includeBlank: false, selected: { variant: "trial" }, variants: [court, trial] });

            expect(container.querySelector(".active")!.textContent).toContain("Trial");
            expect(container.querySelectorAll(".active")).toHaveLength(1);
        });

        it("says which blank form was chosen, with the host's default under it", () => {
            const onChange = vi.fn();
            const container = mount({ baseTemplate: "standard", includeBlank: false, onChange, variants: [court, trial] });

            act(() => row(container, "Trial").click());

            expect(onChange).toHaveBeenCalledWith({ template: "standard", variant: "trial" });
        });
    });
});

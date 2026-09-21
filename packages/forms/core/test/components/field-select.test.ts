// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import FFieldSelect from "../../src/components/field-select/field-select";
import type { IOptionValue } from "../../src/models/field";

// popper measures layout, which jsdom does not have, so it is replaced by something that records how it was used
const popper = vi.hoisted(() => {
    const instance = { destroy: vi.fn(), update: vi.fn() };

    return { createPopper: vi.fn(() => instance), instance };
});

vi.mock("@popperjs/core", () => ({ createPopper: popper.createPopper }));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type Props = Parameters<typeof FFieldSelect>[0];

const alpha: IOptionValue = { value: "A", description: "Alpha" };
const bravo: IOptionValue = { value: "B", description: "Bravo" };
const charlie: IOptionValue = { value: "C", description: "Charlie" };
const options = [alpha, bravo, charlie];

const mounted: Array<() => void> = [];

function mount(props: Partial<Props> = {}) {
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);

    const render = (next: Partial<Props> = props): void => {
        act(() => root.render(createElement(FFieldSelect, { options, ...next })));
    };

    render();
    mounted.push(() => { act(() => root.unmount()); container.remove(); });

    return {
        container,
        render,
        toggle: () => container.querySelector<HTMLElement>(".f-field-select__toggle")!,
        menu: () => container.querySelector<HTMLElement>(".f-field-select__dropdown-menu")!,
        optionTexts: () => Array.from(container.querySelectorAll(".f-field-select__dropdown-item")).map(item => item.textContent),
        optionLink: (text: string) => Array.from(container.querySelectorAll<HTMLElement>(".f-field-select__dropdown-item")).find(item => item.textContent === text)!
    };
}

/** Lets the options load, which takes a couple of turns of the microtask queue. */
async function settle(): Promise<void> {
    await act(async () => {
        await Promise.resolve();
        await Promise.resolve();
    });
}

/** Opens the menu, and waits for its options to load. */
async function open(select: ReturnType<typeof mount>): Promise<void> {
    act(() => select.toggle().click());
    await settle();
}

/** Types into an input the way a user would; React ignores a value set straight on the element. */
function type(input: HTMLInputElement, value: string): void {
    const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;

    act(() => {
        setValue.call(input, value);
        input.dispatchEvent(new Event("input", { bubbles: true }));
    });
}

beforeEach(() => {
    popper.createPopper.mockClear();
    popper.instance.destroy.mockClear();
    popper.instance.update.mockClear();
});

afterEach(() => {
    mounted.splice(0).forEach(unmount => unmount());
});

describe("FFieldSelect", () => {
    describe("the toggle", () => {
        it("shows the placeholder while nothing is selected", () => {
            expect(mount().toggle().textContent).toBe("Select...");
            expect(mount({ placeholder: "Choose a make" }).toggle().textContent).toBe("Choose a make");
        });

        it("counts a pair with neither half filled in as no selection at all", () => {
            expect(mount({ value: { value: "", description: "" } }).toggle().textContent).toBe("Select...");
        });

        it("has the id it is given, and can be marked invalid", () => {
            const { toggle } = mount({ id: "make", invalid: true });

            expect(toggle().id).toBe("make");
            expect(toggle().classList.contains("is-invalid")).toBe(true);
        });

        it("shows nothing while it is disabled, so that a locked field shows no prompt", () => {
            const { toggle } = mount({ disabled: true });

            expect(toggle().textContent).toBe("");
            expect((toggle() as HTMLButtonElement).disabled).toBe(true);
        });

        it("keeps showing the placeholder while disabled when it is disabled for want of another field, if asked to", () => {
            expect(mount({ disabled: true, showPlaceholderWhenDisabled: true }).toggle().textContent).toBe("Select...");
        });

        it("shows a selection that is disabled all the same", () => {
            expect(mount({ disabled: true, value: alpha }).toggle().textContent).toBe("A - Alpha");
        });

        it.each([
            ["valueAndDescription", "A - Alpha"],
            ["valueOnly", "A"],
            ["descriptionOnly", "Alpha"]
        ] as const)("shows the selection in the %s format as %s", (format, expected) => {
            expect(mount({ format, value: alpha }).toggle().textContent).toBe(expected);
        });

        it("shows a single selection of several, and counts more than one", () => {
            expect(mount({ multiple: true, value: [alpha] }).toggle().textContent).toBe("A - Alpha");
            expect(mount({ multiple: true, value: [alpha, bravo] }).toggle().textContent).toBe("2 selected");
        });

        it("refuses a list of values when it takes only one", () => {
            const container = document.createElement("div");
            const root = createRoot(container);
            const error = vi.spyOn(console, "error").mockImplementation(() => undefined);

            try {
                expect(() => act(() => root.render(createElement(FFieldSelect, { options, value: [alpha] })))).toThrow("multiple must be true if value is an array.");
            } finally {
                error.mockRestore();
            }
        });
    });

    describe("the menu", () => {
        it("is closed to begin with, and opens when the toggle is clicked", async () => {
            const select = mount();

            expect(select.menu().classList.contains("show")).toBe(false);

            await open(select);

            expect(select.menu().classList.contains("show")).toBe(true);
        });

        it("lists every option, with its value and description, once it has loaded", async () => {
            const select = mount();

            act(() => select.toggle().click());
            expect(select.menu().textContent).toContain("Loading...");

            await settle();

            expect(select.optionTexts()).toEqual(["A - Alpha", "B - Bravo", "C - Charlie"]);
        });

        it("says so when there is nothing to choose from", async () => {
            const select = mount({ options: [] });

            await open(select);

            expect(select.menu().textContent).toContain("No results found");
        });

        it("puts the menu where it is told to be", async () => {
            await open(mount({ menuPlacement: "top-end" }));

            expect(popper.createPopper).toHaveBeenCalledWith(expect.anything(), expect.anything(), { placement: "top-end" });
        });

        it("lets the menu go when it closes", async () => {
            const select = mount();

            await open(select);
            act(() => select.toggle().click());

            expect(select.menu().classList.contains("show")).toBe(false);
            expect(popper.instance.destroy).toHaveBeenCalled();
        });

        it("closes when something outside it is clicked", async () => {
            const select = mount();
            await open(select);

            act(() => document.body.click());

            expect(select.menu().classList.contains("show")).toBe(false);
        });

        it("stays open when something inside it is clicked", async () => {
            const select = mount({ searchable: true });
            await open(select);

            act(() => select.container.querySelector<HTMLElement>(".f-field-select__search")!.click());

            expect(select.menu().classList.contains("show")).toBe(true);
        });
    });

    describe("loading the options", () => {
        it("does not ask for them until the menu is opened", () => {
            const load = vi.fn(async () => options);

            mount({ options: load });

            expect(load).not.toHaveBeenCalled();
        });

        it("asks for them when the menu is opened, for the value of the field they hang off", async () => {
            const load = vi.fn(async () => options);
            const select = mount({ options: load, parentValue: "SC" });

            await open(select);

            expect(load).toHaveBeenCalledWith("SC");
            expect(select.optionTexts()).toEqual(["A - Alpha", "B - Bravo", "C - Charlie"]);
        });

        it("asks again when the field they hang off changes", async () => {
            const load = vi.fn(async () => options);
            const select = mount({ options: load, parentValue: "SC" });
            await open(select);

            select.render({ options: load, parentValue: "GA" });
            await settle();

            expect(load).toHaveBeenLastCalledWith("GA");
        });
    });

    describe("choosing", () => {
        it("says which option was chosen, and closes the menu", async () => {
            const onChange = vi.fn();
            const select = mount({ onChange });
            await open(select);

            act(() => select.optionLink("B - Bravo").click());

            expect(onChange).toHaveBeenCalledWith(bravo);
            expect(select.menu().classList.contains("show")).toBe(false);
        });

        it("does not follow the link an option is", async () => {
            const select = mount();
            await open(select);
            const event = new MouseEvent("click", { bubbles: true, cancelable: true });

            act(() => { select.optionLink("B - Bravo").dispatchEvent(event); });

            expect(event.defaultPrevented).toBe(true);
        });

        it("marks the option that is selected", async () => {
            const select = mount({ value: bravo });
            await open(select);

            expect(select.optionLink("B - Bravo").querySelector("i.bi-check-circle-fill")).not.toBeNull();
            expect(select.optionLink("A - Alpha").querySelector("i.bi-check-circle-fill")).toBeNull();
        });

        it("adds an option to those selected when it takes several, and stays open for more", async () => {
            const onChange = vi.fn();
            const select = mount({ multiple: true, onChange, value: [alpha] });
            await open(select);

            act(() => select.optionLink("B - Bravo").click());

            expect(onChange).toHaveBeenCalledWith([alpha, bravo]);
            expect(select.menu().classList.contains("show")).toBe(true);
        });

        it("takes an option away from those selected when it is chosen again", async () => {
            const onChange = vi.fn();
            const select = mount({ multiple: true, onChange, value: [alpha, bravo] });
            await open(select);

            act(() => select.optionLink("A - Alpha").click());

            expect(onChange).toHaveBeenCalledWith([bravo]);
        });

        it("starts a selection when it takes several and has none", async () => {
            const onChange = vi.fn();
            const select = mount({ multiple: true, onChange });
            await open(select);

            act(() => select.optionLink("C - Charlie").click());

            expect(onChange).toHaveBeenCalledWith([charlie]);
        });

        it("can be chosen from with nobody listening", async () => {
            const select = mount();
            await open(select);

            expect(() => act(() => select.optionLink("A - Alpha").click())).not.toThrow();
        });
    });

    describe("searching", () => {
        const searchBox = (select: ReturnType<typeof mount>): HTMLInputElement => select.container.querySelector<HTMLInputElement>(".f-field-select__search input")!;

        it("offers no search box unless asked to", async () => {
            const select = mount();
            await open(select);

            expect(select.container.querySelector(".f-field-select__search")).toBeNull();
        });

        it("narrows the options to those whose value or description hold what was typed, in any case", async () => {
            const select = mount({ searchable: true });
            await open(select);

            type(searchBox(select), "brav");
            expect(select.optionTexts()).toEqual(["B - Bravo"]);

            type(searchBox(select), "c");
            expect(select.optionTexts()).toEqual(["C - Charlie"]);
        });

        it("says so when nothing matches", async () => {
            const select = mount({ searchable: true });
            await open(select);

            type(searchBox(select), "zzz");

            expect(select.menu().textContent).toContain("No results found");
        });

        it("starts again from the whole list when the menu is closed by clicking away and opened again", async () => {
            const select = mount({ searchable: true });
            await open(select);
            type(searchBox(select), "brav");

            act(() => document.body.click());
            act(() => select.toggle().click());

            expect(select.optionTexts()).toHaveLength(3);
        });

        it("starts again from the whole list after an option is chosen", async () => {
            const select = mount({ searchable: true });
            await open(select);
            type(searchBox(select), "brav");

            act(() => select.optionLink("B - Bravo").click());
            act(() => select.toggle().click());

            expect(select.optionTexts()).toHaveLength(3);
        });

        it("puts the cursor in the search box when the menu opens", async () => {
            const select = mount({ id: "make", searchable: true });
            await open(select);

            await act(async () => { await new Promise(resolve => setTimeout(resolve, 50)); });

            expect(document.activeElement).toBe(searchBox(select));
        });
    });

    describe("a long list", () => {
        const many = Array.from({ length: 5 }, (_, index) => ({ value: `V${index}`, description: `Value ${index}` }));

        it("shows only as many options as it is allowed to, and says how many there are", async () => {
            const select = mount({ maxVisibleItems: 2, options: many });
            await open(select);

            expect(select.optionTexts()).toEqual(["V0 - Value 0", "V1 - Value 1"]);
            expect(select.menu().textContent).toContain("Showing 2 of 5");
        });

        it("says nothing of the rest when all of them show", async () => {
            const select = mount({ options: many });
            await open(select);

            expect(select.menu().textContent).not.toContain("Showing");
        });

        it("shows every option that matches a search, up to the limit", async () => {
            const select = mount({ maxVisibleItems: 2, options: many, searchable: true });
            await open(select);

            type(select.container.querySelector<HTMLInputElement>(".f-field-select__search input")!, "value");

            expect(select.optionTexts()).toHaveLength(2);
            expect(select.menu().textContent).toContain("Showing 2 of 5");
        });
    });
});

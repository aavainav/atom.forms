// @vitest-environment jsdom
import { act, createElement, createRef } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import FFieldInput from "../../src/components/field-input/field-input";
import type { IFieldInputComponent } from "../../src/components/field-input/field-input";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type Props = Parameters<typeof FFieldInput>[0];

const mounted: Array<() => void> = [];

function mount(props: Props = {}) {
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);
    const ref = createRef<IFieldInputComponent>();

    const render = (next: Props = props): void => {
        act(() => root.render(createElement(FFieldInput, { ...next, ref })));
    };

    render();

    const unmount = (): void => {
        act(() => root.unmount());
        container.remove();
    };
    mounted.push(unmount);

    return { container, input: () => container.querySelector("input")!, ref, render, unmount };
}

/** Types into an input the way a user would; React ignores a value set straight on the element. */
function type(input: HTMLInputElement, value: string): void {
    const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;

    act(() => {
        setValue.call(input, value);
        input.dispatchEvent(new Event("input", { bubbles: true }));
    });
}

function press(input: HTMLInputElement, type: "keydown" | "keypress" | "keyup", key: string): KeyboardEvent {
    const event = new KeyboardEvent(type, { bubbles: true, cancelable: true, charCode: key.length === 1 ? key.charCodeAt(0) : 0, key });
    act(() => { input.dispatchEvent(event); });

    return event;
}

function blur(input: HTMLInputElement): void {
    act(() => { input.dispatchEvent(new FocusEvent("focusout", { bubbles: true })); });
}

/** Lets a promise the input started settle. */
async function settle(): Promise<void> {
    await act(async () => {
        await Promise.resolve();
        await Promise.resolve();
    });
}

afterEach(() => {
    mounted.splice(0).forEach(unmount => unmount());
});

describe("FFieldInput", () => {
    describe("what it shows", () => {
        it("shows the value it is given", () => {
            expect(mount({ value: "Dana" }).input().value).toBe("Dana");
        });

        it("shows nothing for no value", () => {
            expect(mount().input().value).toBe("");
        });

        it("shows a number or a boolean as text", () => {
            expect(mount({ value: 42 }).input().value).toBe("42");
            expect(mount({ value: true }).input().value).toBe("true");
        });

        it("shows a value the way its converter says to", () => {
            const converter = { fromPropertyValue: (value: unknown) => `#${value}` };

            expect(mount({ converter, value: 7 }).input().value).toBe("#7");
        });

        it("shows a value formatted the way its formatter says to", () => {
            expect(mount({ formatter: value => value.toUpperCase(), value: "dana" }).input().value).toBe("DANA");
        });

        it("follows the value when it changes from outside", () => {
            const { input, render } = mount({ value: "Dana" });

            render({ value: "Riley" });

            expect(input().value).toBe("Riley");
        });

        it("has an id, a type and a maximum length and value it is given", () => {
            const { input } = mount({ id: "name", max: "10", maxlength: "5", type: "email" });

            expect(input().id).toBe("name");
            expect(input().type).toBe("email");
            expect(input().maxLength).toBe(5);
            expect(input().max).toBe("10");
        });

        it("shows its placeholder, and not while it is disabled", () => {
            expect(mount({ placeholder: "Last name" }).input().placeholder).toBe("Last name");
            expect(mount({ disabled: true, placeholder: "Last name" }).input().placeholder).toBe("");
        });

        it("can be disabled, and can be marked valid or invalid", () => {
            expect(mount({ disabled: true }).input().disabled).toBe(true);
            expect(mount({ invalid: true }).input().classList.contains("is-invalid")).toBe(true);
            expect(mount({ valid: true }).input().classList.contains("is-valid")).toBe(true);
        });

        it("is bold by default, and can be normal weight or take a class of its own", () => {
            expect(mount().input().classList.contains("fw-bold")).toBe(true);
            expect(mount({ fontWeight: "normal" }).input().classList.contains("fw-normal")).toBe(true);
            expect(mount({ className: "extra" }).input().classList.contains("extra")).toBe(true);
        });

        it("is padded to sit under its label by default, and takes a margin and a padding of its own", () => {
            expect(mount().input().style.paddingTop).toBe("16px");
            expect(mount({ padding: { top: 2 } }).input().style.paddingTop).toBe("2px");
            expect(mount({ margin: { bottom: 5 } }).input().style.marginBottom).toBe("5px");
        });

        it("has its autocomplete on by default, turned off by asking, and turned off for a lookup", () => {
            expect(mount().input().autocomplete).toBe("on");
            expect(mount({ autocomplete: "off" }).input().autocomplete).toBe("off");
            expect(mount({ async: { input: async () => "" } }).input().autocomplete).toBe("off");
        });

        it("is focused when it mounts, if asked", () => {
            const plain = mount().input();
            expect(document.activeElement).not.toBe(plain);

            const focused = mount({ autofocus: true }).input();
            expect(document.activeElement).toBe(focused);
        });
    });

    describe("a date", () => {
        it("is a date input when it has a value", () => {
            expect(mount({ type: "date", value: "2026-09-20" }).input().type).toBe("date");
        });

        it("is a date input while it is empty and can be edited", () => {
            expect(mount({ type: "date" }).input().type).toBe("date");
        });

        it("is plain text while it is empty and disabled, since a disabled empty date would still show its own mm/dd/yyyy hint", () => {
            expect(mount({ disabled: true, type: "date" }).input().type).toBe("text");
        });

        it("stays a date while it is disabled and has a value", () => {
            expect(mount({ disabled: true, type: "date", value: "2026-09-20" }).input().type).toBe("date");
        });
    });

    describe("typing", () => {
        it("says what was typed, as the value and as the raw input", () => {
            const onChange = vi.fn();
            const onInput = vi.fn();
            const { input } = mount({ onChange, onInput });

            type(input(), "Dana");

            expect(onChange).toHaveBeenCalledWith("Dana");
            expect(onInput).toHaveBeenCalledWith("Dana");
        });

        it("says what was typed as the value its converter makes of it", () => {
            const onChange = vi.fn();
            const { input } = mount({ converter: { toPropertyValue: value => Number(value) }, onChange });

            type(input(), "42");

            expect(onChange).toHaveBeenCalledWith(42);
        });

        it("says nothing when what is typed is what it already shows", () => {
            const onChange = vi.fn();
            const { input } = mount({ onChange, value: "Dana" });

            type(input(), "Dana");

            expect(onChange).not.toHaveBeenCalled();
        });

        it("says it was cleared when what was typed is nothing", () => {
            const onClear = vi.fn();
            const { input } = mount({ onClear, value: "Dana" });

            type(input(), "");

            expect(onClear).toHaveBeenCalledTimes(1);
        });

        it("hands key events to whoever asked for them", () => {
            const onKeyDown = vi.fn();
            const onKeyUp = vi.fn();
            const { input } = mount({ onKeyDown, onKeyUp });

            press(input(), "keydown", "a");
            press(input(), "keyup", "a");

            expect(onKeyDown).toHaveBeenCalledTimes(1);
            expect(onKeyUp).toHaveBeenCalledTimes(1);
        });
    });

    describe("which keys it accepts", () => {
        it("accepts every key by default", () => {
            const { input } = mount();

            expect(press(input(), "keypress", "a").defaultPrevented).toBe(false);
            expect(press(input(), "keypress", "7").defaultPrevented).toBe(false);
            expect(press(input(), "keypress", "-").defaultPrevented).toBe(false);
        });

        it("refuses letters when it takes only numbers, but accepts the symbols it is given", () => {
            const { input } = mount({ alphanumeric: false, symbols: ["-"] });

            expect(press(input(), "keypress", "a").defaultPrevented).toBe(true);
            expect(press(input(), "keypress", "7").defaultPrevented).toBe(false);
            expect(press(input(), "keypress", "-").defaultPrevented).toBe(false);
            expect(press(input(), "keypress", "/").defaultPrevented).toBe(true);
        });

        it("refuses digits when it takes only letters", () => {
            const { input } = mount({ number: false });

            expect(press(input(), "keypress", "a").defaultPrevented).toBe(false);
            expect(press(input(), "keypress", "7").defaultPrevented).toBe(true);
        });

        it("hands the key press on to whoever asked for it", () => {
            const onKeyPress = vi.fn();

            press(mount({ onKeyPress }).input(), "keypress", "a");

            expect(onKeyPress).toHaveBeenCalledTimes(1);
        });
    });

    describe("formatting", () => {
        it("formats what is typed as it is typed", () => {
            const onChange = vi.fn();
            const { input } = mount({ formatter: value => value.toUpperCase(), onChange });

            type(input(), "dana");

            expect(input().value).toBe("DANA");
            expect(onChange).toHaveBeenCalledWith("DANA");
        });

        it("puts back what was there when the formatter refuses what was typed", () => {
            const onChange = vi.fn();
            const { input } = mount({ formatter: value => /\d/.test(value) ? undefined : value, onChange });

            type(input(), "ab");
            type(input(), "ab1");

            expect(input().value).toBe("ab");
            expect(onChange).toHaveBeenCalledTimes(1);
            expect(onChange).toHaveBeenCalledWith("ab");
        });

        it("formats once more, in full, when it loses focus", () => {
            const onChange = vi.fn();
            const { input } = mount({ formatter: (value, { partial }) => partial ? value : value.padStart(3, "0"), onChange });

            type(input(), "7");
            blur(input());

            expect(input().value).toBe("007");
            expect(onChange).toHaveBeenLastCalledWith("007");
        });
    });

    describe("clearing", () => {
        it("clears when it loses focus, if asked to", () => {
            const onChange = vi.fn();
            const { input } = mount({ clearOnBlur: true, onChange, value: "Dana" });

            blur(input());

            expect(input().value).toBe("");
            expect(onChange).toHaveBeenCalledWith("");
        });

        it("clears on Escape, if asked to", () => {
            const onClear = vi.fn();
            const { input } = mount({ enableClear: true, onClear, value: "Dana" });

            press(input(), "keydown", "Escape");

            expect(input().value).toBe("");
            expect(onClear).toHaveBeenCalledTimes(1);
        });

        it("does not clear on Escape otherwise", () => {
            const { input } = mount({ value: "Dana" });

            press(input(), "keydown", "Escape");

            expect(input().value).toBe("Dana");
        });

        it("clears from the icon while there is something to clear, if asked to", () => {
            const { container, input } = mount({ enableClear: true, icon: "bi-search", value: "Dana" });

            act(() => container.querySelector<HTMLElement>("i.bi-x")!.click());

            expect(input().value).toBe("");
        });

        it("shows its own icon again once it is empty", () => {
            const { container } = mount({ enableClear: true, icon: "bi-search" });

            expect(container.querySelector("i.bi-x")).toBeNull();
            expect(container.querySelector("i.bi-search")).not.toBeNull();
        });
    });

    describe("the icon", () => {
        it("is drawn beside the input, in the colour it is given", () => {
            const { container } = mount({ icon: "bi-search", iconColor: "danger" });

            expect(container.querySelector(".input-group")).not.toBeNull();
            expect(container.querySelector("i")!.className).toContain("text-danger");
        });

        it("is not drawn when there is none, leaving a bare input", () => {
            const { container } = mount();

            expect(container.querySelector(".input-group")).toBeNull();
            expect(container.firstElementChild!.tagName).toBe("INPUT");
        });

        it("has a tooltip when it is given one", () => {
            const { container } = mount({ icon: "bi-search", iconTooltip: "Search" });

            expect(container.querySelector("[data-bs-toggle=tooltip]")).not.toBeNull();
        });
    });

    describe("a lookup", () => {
        it("starts once what is typed is long enough, handing over what was typed and its value", async () => {
            const lookup = vi.fn(async () => "found");
            const result = vi.fn();
            const onResult = vi.fn();
            const { input } = mount({ async: { input: lookup, result }, onResult });

            type(input(), "abc");
            await settle();

            expect(lookup).toHaveBeenCalledWith("abc", "abc");
            expect(result).toHaveBeenCalledWith("found");
            expect(onResult).toHaveBeenCalledWith("found");
        });

        it("does not start while what is typed is too short", () => {
            const lookup = vi.fn(async () => "found");
            const { input } = mount({ async: { input: lookup } });

            type(input(), "ab");

            expect(lookup).not.toHaveBeenCalled();
        });

        it("waits for as many characters as it is told to", () => {
            const lookup = vi.fn(async () => "found");
            const { input } = mount({ async: { input: lookup, minChars: 5 } });

            type(input(), "abcd");
            expect(lookup).not.toHaveBeenCalled();

            type(input(), "abcde");
            expect(lookup).toHaveBeenCalledTimes(1);
        });

        it("hears nothing from a lookup that another has replaced", async () => {
            const deferred = () => { let resolve!: (value: string) => void; const promise = new Promise<string>(done => { resolve = done; }); return { promise, resolve }; };
            const first = deferred();
            const second = deferred();
            const lookup = vi.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
            const result = vi.fn();
            const { input } = mount({ async: { input: lookup, result } });

            type(input(), "abc");
            type(input(), "abcd");
            second.resolve("second");
            await settle();
            first.resolve("first");
            await settle();

            expect(result).toHaveBeenCalledTimes(1);
            expect(result).toHaveBeenCalledWith("second");
        });

        it("says nothing for a lookup that found nothing", async () => {
            const result = vi.fn();
            const { input } = mount({ async: { input: async () => "", result } });

            type(input(), "abc");
            await settle();

            expect(result).not.toHaveBeenCalled();
        });
    });

    describe("filtering something as it is typed", () => {
        beforeEach(() => { vi.useFakeTimers(); });
        afterEach(() => { vi.useRealTimers(); });

        function filterTarget() {
            const handle = { remove: vi.fn(), replace: vi.fn() };
            const target = { applyFilter: vi.fn(() => handle) };
            const filter = vi.fn(() => true);

            return { filterFor: { filter, minChars: 2, target } as never, filter, handle, target };
        }

        it("filters it once what is typed is long enough, by what was typed", () => {
            const { filter, filterFor, target } = filterTarget();
            const { input } = mount({ filterFor });

            type(input(), "ab");
            act(() => { vi.advanceTimersByTime(0); });

            expect(target.applyFilter).toHaveBeenCalledTimes(1);

            const predicate = (target.applyFilter.mock.calls[0] as Array<(row: string) => boolean>)[0];
            predicate("row");

            expect(filter).toHaveBeenCalledWith("ab", "ab", "row");
        });

        it("does not filter it while what is typed is too short", () => {
            const { filterFor, target } = filterTarget();
            const { input } = mount({ filterFor });

            type(input(), "a");
            act(() => { vi.advanceTimersByTime(0); });

            expect(target.applyFilter).not.toHaveBeenCalled();
        });

        it("filters it by what was typed after it has been prepared", () => {
            const { filter, filterFor, target } = filterTarget();
            const { input } = mount({ filterFor: { ...(filterFor as object), prepare: (value: string) => value.toUpperCase() } as never });

            type(input(), "ab");
            act(() => { vi.advanceTimersByTime(0); });
            (target.applyFilter.mock.calls[0] as Array<(row: string) => boolean>)[0]("row");

            expect(filter).toHaveBeenCalledWith("AB", "ab", "row");
        });

        it("replaces the filter as more is typed, rather than adding another", () => {
            const { filterFor, handle, target } = filterTarget();
            const { input } = mount({ filterFor });

            type(input(), "ab");
            act(() => { vi.advanceTimersByTime(0); });
            type(input(), "abc");
            act(() => { vi.advanceTimersByTime(0); });

            expect(target.applyFilter).toHaveBeenCalledTimes(1);
            expect(handle.replace).toHaveBeenCalledTimes(1);
        });

        it("takes the filter off when what is typed is cleared", () => {
            const { filterFor, handle } = filterTarget();
            const { input } = mount({ filterFor });

            type(input(), "ab");
            act(() => { vi.advanceTimersByTime(0); });
            type(input(), "");

            expect(handle.remove).toHaveBeenCalledTimes(1);
        });

        it("takes the filter off when it is removed", () => {
            const { filterFor, handle } = filterTarget();
            const { input, unmount } = mount({ filterFor });

            type(input(), "ab");
            act(() => { vi.advanceTimersByTime(0); });
            unmount();

            expect(handle.remove).toHaveBeenCalledTimes(1);
        });
    });

    describe("its handle", () => {
        it("can be focused from outside", () => {
            const { input, ref } = mount();

            act(() => ref.current!.focus());

            expect(document.activeElement).toBe(input());
        });
    });
});

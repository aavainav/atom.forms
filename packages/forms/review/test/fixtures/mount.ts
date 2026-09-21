import { act } from "react";
import type { ReactElement } from "react";
import { createRoot } from "react-dom/client";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const mounted: Array<() => void> = [];

/** Renders an element into a container attached to the document, which is what a portal or a lookup by id needs. */
export function mount(element: ReactElement): HTMLElement {
    const container = document.createElement("div");
    document.body.append(container);

    const root = createRoot(container);
    act(() => root.render(element));

    mounted.push(() => {
        act(() => root.unmount());
        container.remove();
    });

    return container;
}

/** Unmounts everything mounted since the last call, and clears anything else a test put in the document. */
export function unmountAll(): void {
    mounted.splice(0).forEach(unmount => unmount());
    document.body.innerHTML = "";
}

/** Finds the button with exactly this text. */
export function findButton(container: ParentNode, text: string): HTMLButtonElement | undefined {
    return Array.from(container.querySelectorAll("button")).find(button => button.textContent === text);
}

/** Clicks an element the way a user would, letting React settle. */
export function click(element: HTMLElement | undefined): void {
    if (!element) {
        throw new Error("There is nothing there to click.");
    }

    act(() => element.click());
}

/** Types into a text area the way a user would; React ignores a value set straight on the element. */
export function type(element: HTMLTextAreaElement | null, value: string): void {
    if (!element) {
        throw new Error("There is nothing there to type into.");
    }

    const setValue = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!.set!;

    act(() => {
        setValue.call(element, value);
        element.dispatchEvent(new Event("input", { bubbles: true }));
    });
}

import { act, createElement, ComponentType, ReactElement } from "react";
import { createRoot } from "react-dom/client";
import { vi, Mock } from "vitest";
import { ISectionBinding, FieldDefinition, FieldModel, SectionDefinition, SectionModel, TValueType } from "@forms/core";

import { TrialPageModel } from "../../src/models/trial-page/trial-page";
import { createForm } from "./form";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const mounted: Array<() => void> = [];

/** Renders an element into a container attached to the document, so a field's box can be found by its id. */
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

/** Unmounts everything mounted since the last call. */
export function unmountAll(): void {
    mounted.splice(0).forEach(unmount => unmount());
}

/** A trial section as mounted: its definition, the section instance it was drawn from, and what it wrote back. */
export interface IMountedTrialSection<TSection extends SectionModel> {
    readonly definition: SectionDefinition<TSection>;
    readonly section: TSection;
    readonly setValue: Mock<ISectionBinding<TSection>["setValue"]>;
}

/** Renders one of the trial page's section components against that section of a real, freshly built form, recording what it writes back. */
export async function mountTrialSection<TSection extends SectionModel>(
    select: (page: TrialPageModel) => SectionDefinition<TSection>,
    component: ComponentType<{ binding: ISectionBinding<TSection> }>): Promise<IMountedTrialSection<TSection>> {
    const form = await createForm();
    const page = form.getTrialPageCollection().getFirstPage<TrialPageModel>();
    const definition = select(page);
    const section = page.get<TSection>(definition);
    const setValue = vi.fn<ISectionBinding<TSection>["setValue"]>();
    const binding: ISectionBinding<TSection> = { sectionDefinition: definition, get: () => section, setValue, update: vi.fn() };

    mount(createElement(component, { binding }));

    return { definition, section, setValue };
}

/** The ids of every field the section definition declares, as the section instance carries them. */
export function getFieldIds(section: SectionModel, definition: SectionDefinition<SectionModel>): Array<string> {
    return definition.children
        .filter(child => child instanceof FieldDefinition)
        .map(child => section.get<FieldModel<TValueType>>(child as FieldDefinition<FieldModel<TValueType>>).id!);
}

/** Finds a field's input by the field's id, failing if the component drew no box for it. */
export function getInput(id: string | undefined): HTMLInputElement {
    const input = id ? document.getElementById(id) : null;

    if (!(input instanceof HTMLInputElement)) {
        throw new Error(`No input was drawn for the field ${id}.`);
    }

    return input;
}

/** Types into an input the way a user would; React ignores a value set straight on the element. */
export function type(input: HTMLInputElement, value: string): void {
    const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;

    act(() => {
        setValue.call(input, value);
        input.dispatchEvent(new Event("input", { bubbles: true }));
    });
}

/** Clicks an element the way a user would, letting React settle. */
export function click(element: HTMLElement): void {
    act(() => element.click());
}

import { act, createElement, ComponentType } from "react";
import { createRoot } from "react-dom/client";
import { vi, Mock } from "vitest";
import { ServicesContext } from "@common/react";
import { ISectionBinding, FieldDefinition, FieldModel, SectionDefinition, SectionModel, TValueType } from "@forms/core";
import { IServiceCollection } from "@shrub/core";

import { RecordPageModel } from "../../src/models/record-page/record-page";
import { IPublicContactOrWarningService } from "../../src/services";
import { createForm } from "./form";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const mounted: Array<() => void> = [];

/** Every value list loader answers with no options; the tests here are about the boxes, not the lists. */
const service = {
    getCountyOptions: async () => [],
    getGenderOptions: async () => [],
    getRaceOptions: async () => [],
    getStateOptions: async () => [],
    getVehicleMakeOptions: async () => [],
    getVehicleModelOptions: async () => []
};
const registry = new Map<unknown, unknown>([[IPublicContactOrWarningService, service]]);
const services = { get: (key: unknown) => registry.get(key) } as IServiceCollection;

/** Unmounts everything mounted since the last call. */
export function unmountAll(): void {
    mounted.splice(0).forEach(unmount => unmount());
}

/** A section as mounted: its definition, the section instance it was drawn from, and what it wrote back. */
export interface IMountedSection<TSection extends SectionModel> {
    readonly definition: SectionDefinition<TSection>;
    readonly section: TSection;
    readonly setValue: Mock<ISectionBinding<TSection>["setValue"]>;
    readonly update: Mock<ISectionBinding<TSection>["update"]>;

    /** Runs the last update the section asked for against the section it was drawn from. */
    applyLastUpdate(): TSection;
}

type SectionComponent<TSection extends SectionModel> = ComponentType<{ binding: ISectionBinding<TSection> }>;

/** Renders one of the record page's section components against that section of a real, freshly built form, optionally changed first, recording what it writes back. */
export async function mountRecordSection<TSection extends SectionModel>(
    select: (page: RecordPageModel) => SectionDefinition<TSection>,
    component: SectionComponent<TSection>,
    prepare: (section: TSection) => TSection = section => section): Promise<IMountedSection<TSection>> {
    const page = (await createForm()).getRecordPageCollection().getFirstPage<RecordPageModel>();
    const definition = select(page);
    const section = prepare(page.get<TSection>(definition));
    const setValue = vi.fn<ISectionBinding<TSection>["setValue"]>();
    const update = vi.fn<ISectionBinding<TSection>["update"]>();
    const binding: ISectionBinding<TSection> = { sectionDefinition: definition, get: () => section, setValue, update };

    const container = document.createElement("div");
    document.body.append(container);

    const root = createRoot(container);
    act(() => root.render(createElement(ServicesContext.Provider, { value: services }, createElement(component, { binding }))));

    mounted.push(() => {
        act(() => root.unmount());
        container.remove();
    });

    return { definition, section, setValue, update, applyLastUpdate: () => update.mock.lastCall![0].update(section) };
}

/** The ids of every field the section definition declares, as the section instance carries them. */
export function getFieldIds(section: SectionModel, definition: SectionDefinition<SectionModel>): Array<string> {
    return definition.children
        .filter(child => child instanceof FieldDefinition)
        .map(child => section.get<FieldModel<TValueType>>(child as FieldDefinition<FieldModel<TValueType>>).id!);
}

/** Finds a field's box by the field's id -- an input, or a select's toggle button -- failing if the component drew none. */
export function getControl(id: string | undefined): HTMLInputElement | HTMLButtonElement {
    const control = id ? document.getElementById(id) : null;

    if (!(control instanceof HTMLInputElement || control instanceof HTMLButtonElement)) {
        throw new Error(`No box was drawn for the field ${id}.`);
    }

    return control;
}

/** Finds a field's input by the field's id, failing if the component drew no input for it. */
export function getInput(id: string | undefined): HTMLInputElement {
    const input = getControl(id);

    if (!(input instanceof HTMLInputElement)) {
        throw new Error(`The field ${id} was not drawn as an input.`);
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

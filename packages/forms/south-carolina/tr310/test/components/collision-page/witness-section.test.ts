import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import { ServicesContext } from "@common/react";
import { ISectionCollectionBinding, OptionFieldModel, StringFieldModel } from "@forms/core";
import type { IServiceCollection } from "@shrub/core";

import { WitnessSection } from "../../../src/components/collision-page/witness-section";
import { WitnessSectionModel } from "../../../src/models/collision-page/witness-section";
import { ITR310Service } from "../../../src/services";
import { createForm } from "../../fixtures/form";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const mounted: Array<() => void> = [];

/** Binds the three witness rows of a real, freshly-built form's collision page. */
async function mount() {
    const form = await createForm();
    const page = form.getCollisionPage();
    const collection = page.getWitnessSection();
    const binding: ISectionCollectionBinding<WitnessSectionModel> = {
        sectionDefinition: page.witnessSection,
        get: () => collection,
        getSection: (index) => ({
            sectionDefinition: page.witnessSection,
            get: () => collection.getSections<WitnessSectionModel>()[index],
            setValue: () => {},
            update: () => {}
        }),
        update: () => {}
    };

    const registry = new Map<unknown, unknown>([[ITR310Service, { getStateOptions: async () => [] }]]);
    const services = { get: (service: unknown) => registry.get(service) } as IServiceCollection;
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);

    act(() => root.render(createElement(ServicesContext.Provider, { value: services }, createElement(WitnessSection, { binding }))));
    // the state field's options load after the first render, even from a load() that resolves synchronously
    await act(async () => { await Promise.resolve(); });
    mounted.push(() => { act(() => root.unmount()); container.remove(); });

    return { container, headerSection: collection.getSections<WitnessSectionModel>()[0] };
}

afterEach(() => {
    mounted.splice(0).forEach(unmount => unmount());
});

describe("WitnessSection", () => {
    it("prints each column's label once, in a header row, instead of repeating it on every witness row", async () => {
        const { container, headerSection } = await mount();

        const rows = container.querySelectorAll(".f-form-stackpanel.flex-row");
        const headerLabels = Array.from(rows[0].querySelectorAll(".f-label")).map(element => element.textContent);

        expect(headerLabels).toEqual([
            headerSection.get<StringFieldModel>(headerSection.type).label,
            headerSection.get<StringFieldModel>(headerSection.firstName).label,
            headerSection.get<StringFieldModel>(headerSection.middleInitial).label,
            headerSection.get<StringFieldModel>(headerSection.lastName).label,
            headerSection.get<StringFieldModel>(headerSection.address).label,
            headerSection.get<StringFieldModel>(headerSection.city).label,
            headerSection.get<OptionFieldModel>(headerSection.state).label,
            headerSection.get<StringFieldModel>(headerSection.zipCode).label,
            headerSection.get<StringFieldModel>(headerSection.telephone).label,
            headerSection.get<StringFieldModel>(headerSection.propertyDamageAmount).label,
            headerSection.get<StringFieldModel>(headerSection.propertyDamageDescription).label
        ]);
    });

    it("renders one header row plus one row per witness, four in total", async () => {
        const { container } = await mount();

        expect(container.querySelectorAll(".f-form-stackpanel.flex-row")).toHaveLength(4);
    });

    it("renders none of the three data rows with their own label", async () => {
        const { container } = await mount();

        expect(container.querySelectorAll("label")).toHaveLength(0);
    });
});

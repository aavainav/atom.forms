import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import { ServicesContext } from "@common/react";
import { getRenderedHiddenFieldIds, ISectionBinding } from "@forms/core";
import type { IServiceCollection } from "@shrub/core";

import { PersonHeaderSection } from "../../../src/components/person-page/person-header-section";
import { PersonHeaderSectionModel } from "../../../src/models/person-page/person-header-section";
import { ITR310Service } from "../../../src/services";
import { createForm } from "../../fixtures/form";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const mounted: Array<() => void> = [];

/** Binds the person header section of a real, freshly-built form -- its hidden id included, though nothing here should ever render it. */
async function mount() {
    const form = await createForm();
    const page = form.getPersonPages()[0];
    const section = page.getPersonHeaderSection();
    const binding: ISectionBinding<PersonHeaderSectionModel> = {
        sectionDefinition: page.personHeaderSection,
        get: () => section,
        setValue: () => {},
        update: () => {}
    };

    const registry = new Map<unknown, unknown>([[ITR310Service, { getPersonTypeOptions: async () => [] }]]);
    const services = { get: (service: unknown) => registry.get(service) } as IServiceCollection;
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);

    act(() => root.render(createElement(ServicesContext.Provider, { value: services }, createElement(PersonHeaderSection, { binding }))));
    // CodedField loads its options after the first render, even from a load() that resolves synchronously
    await act(async () => { await Promise.resolve(); });
    mounted.push(() => { act(() => root.unmount()); container.remove(); });

    return { container, section };
}

afterEach(() => {
    mounted.splice(0).forEach(unmount => unmount());
});

describe("PersonHeaderSection", () => {
    /**
     * The section's model carries a fifth field, `personId`, that exists only so a person keeps its identity
     * across a save and must never reach the officer. This is the guard for that: every rendered control is given
     * its field's own id, so a stray binding for the hidden field would put an element under this id in the DOM.
     */
    it("renders nothing under any of the section's hidden fields", async () => {
        const { container, section } = await mount();

        expect(getRenderedHiddenFieldIds(container, section)).toEqual([]);
    });
});

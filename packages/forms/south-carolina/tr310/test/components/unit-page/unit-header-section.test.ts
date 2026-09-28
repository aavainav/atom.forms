import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import { getRenderedHiddenFieldIds, ISectionBinding } from "@forms/core";

import { UnitHeaderSection } from "../../../src/components/unit-page/unit-header-section";
import { UnitHeaderSectionModel } from "../../../src/models/unit-page/unit-header-section";
import { createForm } from "../../fixtures/form";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const mounted: Array<() => void> = [];

/** Binds the unit header section of a real, freshly-built form -- its hidden id included, though nothing here should ever render it. */
async function mount() {
    const form = await createForm();
    const page = form.getUnitPages()[0];
    const section = page.getUnitHeaderSection();
    const binding: ISectionBinding<UnitHeaderSectionModel> = {
        sectionDefinition: page.unitHeaderSection,
        get: () => section,
        setValue: () => {},
        update: () => {}
    };

    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);

    act(() => root.render(createElement(UnitHeaderSection, { binding })));
    mounted.push(() => { act(() => root.unmount()); container.remove(); });

    return { container, section };
}

afterEach(() => {
    mounted.splice(0).forEach(unmount => unmount());
});

describe("UnitHeaderSection", () => {
    /**
     * The section's model carries a fourth field, `unitId`, that exists only so a unit keeps its identity across
     * a save and must never reach the officer. This is the guard for that: every rendered control is given its
     * field's own id, so a stray binding for the hidden field would put an element under this id in the DOM.
     */
    it("renders nothing under any of the section's hidden fields", async () => {
        const { container, section } = await mount();

        expect(getRenderedHiddenFieldIds(container, section)).toEqual([]);
    });
});

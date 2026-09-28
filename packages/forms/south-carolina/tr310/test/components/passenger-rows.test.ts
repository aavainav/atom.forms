import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import { ServicesContext } from "@common/react";
import { ISectionBinding, OptionFieldModel, StringFieldModel } from "@forms/core";
import type { IServiceCollection } from "@shrub/core";

import { PassengerRows } from "../../src/components/passenger-rows";
import { PassengersSectionModel } from "../../src/models/person-page/passengers-section";
import { ITR310Service } from "../../src/services";
import { createForm } from "../fixtures/form";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const mounted: Array<() => void> = [];

/** Binds the four passenger rows of a real, freshly-built form's first person page. */
async function mount() {
    const form = await createForm();
    const page = form.getPersonPages()[0];
    const sections = page.getPassengersSection().getSections<PassengersSectionModel>();
    const rows: Array<ISectionBinding<PassengersSectionModel>> = sections.map((section, index) => ({
        sectionDefinition: page.passengersSection,
        get: () => sections[index],
        setValue: () => {},
        update: () => {}
    }));

    const noOptions = async () => [];
    const registry = new Map<unknown, unknown>([[ITR310Service, {
        getAirBagDeploymentOptions: noOptions,
        getEjectionOptions: noOptions,
        getGenderOptions: noOptions,
        getHeadInjuryOptions: noOptions,
        getInjuryStatusOptions: noOptions,
        getMedicalFacilityTransportOptions: noOptions,
        getRestraintDeviceOptions: noOptions,
        getSafetyEquipmentUseOptions: noOptions
    }]]);
    const services = { get: (service: unknown) => registry.get(service) } as IServiceCollection;
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);

    act(() => root.render(createElement(ServicesContext.Provider, { value: services }, createElement(PassengerRows, { rows }))));
    // the coded fields' options load after the first render, even from a load() that resolves synchronously
    await act(async () => { await Promise.resolve(); });
    mounted.push(() => { act(() => root.unmount()); container.remove(); });

    return { container, headerSection: sections[0] };
}

afterEach(() => {
    mounted.splice(0).forEach(unmount => unmount());
});

describe("PassengerRows", () => {
    it("prints each column's label once, in a header row, instead of repeating it on every passenger row", async () => {
        const { container, headerSection } = await mount();

        const rows = container.querySelectorAll(".f-form-stackpanel.flex-row");
        const headerLabels = Array.from(rows[0].querySelectorAll(".f-label")).map(element => element.textContent);

        expect(headerLabels).toEqual([
            headerSection.get<StringFieldModel>(headerSection.personNumber).label,
            headerSection.get<StringFieldModel>(headerSection.unitNumber).label,
            headerSection.get<StringFieldModel>(headerSection.nameAndAddress).label,
            headerSection.get<StringFieldModel>(headerSection.dateOfBirth).label,
            headerSection.get<OptionFieldModel>(headerSection.injuryStatus).label,
            headerSection.get<OptionFieldModel>(headerSection.sex).label,
            headerSection.get<StringFieldModel>(headerSection.race).label,
            headerSection.get<StringFieldModel>(headerSection.seatingLocation).label,
            headerSection.get<OptionFieldModel>(headerSection.ejection).label,
            headerSection.get<OptionFieldModel>(headerSection.medicalFacilityTransport).label,
            headerSection.get<OptionFieldModel>(headerSection.airBagDeployment).label,
            headerSection.get<OptionFieldModel>(headerSection.safetyEquipment).label,
            headerSection.get<OptionFieldModel>(headerSection.restraintDevice).label,
            headerSection.get<OptionFieldModel>(headerSection.headInjury).label
        ]);
    });

    it("renders one header row plus one row per passenger", async () => {
        const { container } = await mount();

        expect(container.querySelectorAll(".f-form-stackpanel.flex-row")).toHaveLength(5);
    });

    it("renders none of the four data rows with their own label", async () => {
        const { container } = await mount();

        expect(container.querySelectorAll("label")).toHaveLength(0);
    });
});

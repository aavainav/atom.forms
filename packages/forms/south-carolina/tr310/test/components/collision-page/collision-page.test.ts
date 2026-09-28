// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { IControllerManager, IPageBinding } from "@forms/core";

import CollisionPage from "../../../src/components/collision-page/collision-page";
import type { CollisionPageModel } from "../../../src/models/collision-page/collision-page";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// each section is replaced with a marker carrying its own name, so the composition under test can be checked by
// where those markers land in the tree rather than by rendering every section's own fields and options
function marker(name: string) {
    return () => createElement("div", { "data-testid": name });
}

vi.mock("../../../src/components/collision-page/header-section", () => ({ HeaderSection: marker("header") }));
vi.mock("../../../src/components/collision-page/collision-section", () => ({ CollisionSection: marker("collision") }));
vi.mock("../../../src/components/collision-page/route-section", () => ({ RouteSection: marker("route") }));
vi.mock("../../../src/components/collision-page/base-intersection-section", () => ({ BaseIntersectionSection: marker("base-intersection") }));
vi.mock("../../../src/components/collision-page/second-intersection-section", () => ({ SecondIntersectionSection: marker("second-intersection") }));
vi.mock("../../../src/components/collision-page/coordinates-section", () => ({ CoordinatesSection: marker("coordinates") }));
vi.mock("../../../src/components/collision-page/trafficway-section", () => ({ TrafficwaySection: marker("trafficway") }));
vi.mock("../../../src/components/collision-page/barrier-section", () => ({ BarrierSection: marker("barrier") }));
vi.mock("../../../src/components/collision-page/conditions-section", () => ({ ConditionsSection: marker("conditions") }));
vi.mock("../../../src/components/collision-page/harmful-event-section", () => ({ HarmfulEventSection: marker("harmful-event") }));
vi.mock("../../../src/components/collision-page/junction-section", () => ({ JunctionSection: marker("junction") }));
vi.mock("../../../src/components/collision-page/work-zone-section", () => ({ WorkZoneSection: marker("work-zone") }));
vi.mock("../../../src/components/collision-page/witness-section", () => ({ WitnessSection: marker("witness") }));
vi.mock("../../../src/components/collision-page/collision-officer-section", () => ({ CollisionOfficerSection: marker("collision-officer") }));

/** A page binding whose section definitions are just their own names -- enough for the page to ask for a binding per section, since every section itself is mocked away and never looks at what it is handed. */
function stubBinding(): IPageBinding<CollisionPageModel> {
    const page = {
        headerSection: "headerSection",
        collisionSection: "collisionSection",
        routeSection: "routeSection",
        baseIntersectionSection: "baseIntersectionSection",
        secondIntersectionSection: "secondIntersectionSection",
        coordinatesSection: "coordinatesSection",
        trafficwaySection: "trafficwaySection",
        barrierSection: "barrierSection",
        conditionsSection: "conditionsSection",
        harmfulEventSection: "harmfulEventSection",
        junctionSection: "junctionSection",
        workZoneSection: "workZoneSection",
        witnessSection: "witnessSection",
        collisionOfficerSection: "collisionOfficerSection"
    } as unknown as CollisionPageModel;

    return {
        mode: "editable",
        pageDefinition: {} as IPageBinding<CollisionPageModel>["pageDefinition"],
        pageId: "page-1",
        get: () => page,
        getSection: (definition: unknown) => ({ sectionDefinition: definition }) as any,
        getSectionCollection: (definition: unknown) => ({ sectionDefinition: definition }) as any,
        isSectionLocked: () => false,
        update: () => undefined
    };
}

const mounted: Array<() => void> = [];

function mount(): HTMLElement {
    const container = document.createElement("div");
    const root = createRoot(container);

    act(() => root.render(createElement(CollisionPage, { controllers: {} as IControllerManager, binding: stubBinding() })));
    mounted.push(() => act(() => root.unmount()));

    return container;
}

function findMarker(container: HTMLElement, name: string): HTMLElement {
    return container.querySelector(`[data-testid="${name}"]`)!;
}

afterEach(() => {
    mounted.splice(0).forEach(unmount => unmount());
});

describe("CollisionPage", () => {
    it("renders every section", () => {
        const container = mount();

        ["header", "collision", "route", "base-intersection", "second-intersection", "coordinates", "trafficway", "barrier", "conditions", "harmful-event", "junction", "work-zone", "witness", "collision-officer"]
            .forEach(name => expect(findMarker(container, name)).not.toBeNull());
    });

    it("groups the route, both intersections, and the GPS coordinates into one row, side by side", () => {
        const container = mount();
        const row = findMarker(container, "route").closest(".f-form-stackpanel.flex-row");

        expect(row).not.toBeNull();
        expect(row!.contains(findMarker(container, "base-intersection"))).toBe(true);
        expect(row!.contains(findMarker(container, "second-intersection"))).toBe(true);
        expect(row!.contains(findMarker(container, "coordinates"))).toBe(true);
    });

    it("keeps the collision section out of that row, too wide to fit beside the route and coordinates without narrowing its fields", () => {
        const container = mount();
        const row = findMarker(container, "route").closest(".f-form-stackpanel.flex-row")!;

        expect(row.contains(findMarker(container, "collision"))).toBe(false);
        expect(findMarker(container, "collision").closest(".f-form-stackpanel.flex-row")).toBeNull();
    });
});

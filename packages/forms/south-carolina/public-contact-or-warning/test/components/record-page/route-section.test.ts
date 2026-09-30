import { afterEach, describe, expect, it } from "vitest";

import { RouteSection } from "../../../src/components/record-page/route-section";
import { getFieldIds, getInput, mountRecordSection, type, unmountAll } from "../../fixtures/mount";

afterEach(unmountAll);

describe("RouteSection", () => {
    it("draws a box for every field the section declares", async () => {
        const { definition, section } = await mountRecordSection(page => page.routeSection, RouteSection);

        getFieldIds(section, definition).forEach(id => expect(() => getInput(id)).not.toThrow());
    });

    it("writes what is typed back to its own field", async () => {
        const { section, setValue } = await mountRecordSection(page => page.routeSection, RouteSection);

        type(getInput(section.getNumberOrName().id), "I-26");

        expect(setValue).toHaveBeenCalledWith(section.numberOrName, "I-26");
    });
});

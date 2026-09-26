import { describe, expect, it } from "vitest";

import { humanize } from "../../src/utils/humanize";

describe("humanize", () => {
    it("spells a key out in words, each beginning with a capital", () => {
        expect(humanize("personHeaderPersonType")).toBe("Person Header Person Type");
    });

    it("gives a single word a capital", () => {
        expect(humanize("persons")).toBe("Persons");
    });

    it("leaves a key that is already spelled out as it is", () => {
        expect(humanize("Units")).toBe("Units");
    });

    it("gives an empty key back empty", () => {
        expect(humanize("")).toBe("");
    });
});

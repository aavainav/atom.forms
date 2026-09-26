import { describe, expect, it } from "vitest";

import { isRecord } from "../../src/utils/is-record";

describe("isRecord", () => {
    it("is true for an object that holds others by key", () => {
        expect(isRecord({ name: "Dana" })).toBe(true);
        expect(isRecord({})).toBe(true);
    });

    it("is false for what is not an object", () => {
        expect(isRecord("Dana")).toBe(false);
        expect(isRecord(4)).toBe(false);
        expect(isRecord(true)).toBe(false);
        expect(isRecord(undefined)).toBe(false);
    });

    it("is false for nothing, though nothing is typeof object", () => {
        expect(isRecord(null)).toBe(false);
    });

    it("is false for a list, whatever it holds", () => {
        expect(isRecord([])).toBe(false);
        expect(isRecord([{ name: "Dana" }])).toBe(false);
    });

    it("is false for an option box's pair, which is one field and not two", () => {
        expect(isRecord({ description: "AUTOMOBILE", value: "01" })).toBe(false);
    });

    it("is true for an object that has a value and a description among more", () => {
        expect(isRecord({ description: "AUTOMOBILE", value: "01", extra: true })).toBe(true);
    });

    it("is true for an object that has only one of the pair", () => {
        expect(isRecord({ value: "01" })).toBe(true);
        expect(isRecord({ description: "AUTOMOBILE" })).toBe(true);
    });
});

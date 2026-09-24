import { describe, expect, it } from "vitest";

import { getChangedPaths } from "../../src/utils/changed-paths";

describe("getChangedPaths", () => {
    it("finds nothing when nothing differs", () => {
        expect(getChangedPaths({ a: "1", b: { c: 2 } }, { a: "1", b: { c: 2 } })).toEqual([]);
    });

    it("names a changed value by its key", () => {
        expect(getChangedPaths({ violatorSex: "M", violatorName: "Dana" }, { violatorSex: "F", violatorName: "Dana" })).toEqual(["violatorSex"]);
    });

    it("names a nested change by its dotted path", () => {
        expect(getChangedPaths({ court: { city: "Aiken" } }, { court: { city: "Columbia" } })).toEqual(["court.city"]);
    });

    it("reports a key present on only one side", () => {
        expect(getChangedPaths({ a: "1" }, { a: "1", b: "2" })).toEqual(["b"]);
        expect(getChangedPaths({ a: "1", b: "2" }, { a: "1" })).toEqual(["b"]);
    });

    it("returns paths in a stable order whatever order the keys arrived in", () => {
        expect(getChangedPaths({ b: 1, a: 1 }, { a: 2, b: 2 })).toEqual(["a", "b"]);
    });

    it("treats an option value as one field rather than a code and a description", () => {
        const before = { violatorSex: { value: "M", description: "Male" } };
        const after = { violatorSex: { value: "F", description: "Female" } };

        expect(getChangedPaths(before, after)).toEqual(["violatorSex"]);
    });

    it("treats an array of plain values as one value", () => {
        expect(getChangedPaths({ boxes: ["a", "b"] }, { boxes: ["a", "c"] })).toEqual(["boxes"]);
        expect(getChangedPaths({ boxes: ["a", "b"] }, { boxes: ["a", "b"] })).toEqual([]);
    });

    it("compares the records in an array by position", () => {
        const before = { additionalViolations: [{ description: "Speeding" }, { description: "Signal" }] };
        const after = { additionalViolations: [{ description: "Speeding" }, { description: "Stop sign" }] };

        expect(getChangedPaths(before, after)).toEqual(["additionalViolations[1].description"]);
    });

    it("reports a record added or removed as itself rather than field by field", () => {
        const one = { list: [{ a: "1", b: "2" }] };
        const two = { list: [{ a: "1", b: "2" }, { a: "3", b: "4" }] };

        expect(getChangedPaths(one, two)).toEqual(["list[1]"]);
        expect(getChangedPaths(two, one)).toEqual(["list[1]"]);
    });

    it("does not blame the records that moved when one in the middle is added or removed", () => {
        const two = { list: [{ a: "1" }, { a: "3" }] };
        const three = { list: [{ a: "1" }, { a: "2" }, { a: "3" }] };

        expect(getChangedPaths(three, two)).toEqual(["list[2]"]);
        expect(getChangedPaths(two, three)).toEqual(["list[2]"]);
    });

    it("tells a value that was never answered from one that was", () => {
        expect(getChangedPaths({ a: undefined }, { a: "" })).toEqual(["a"]);
    });

    it("never carries the values themselves", () => {
        const paths = getChangedPaths({ violatorName: "Dana" }, { violatorName: "Riley" });

        expect(JSON.stringify(paths)).not.toMatch(/Dana|Riley/);
    });
});

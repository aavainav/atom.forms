import { describe, expect, it } from "vitest";

import { isAnswered } from "../../src/utils/is-answered";

describe("isAnswered", () => {
    it("is true for text, a number, a checked box and a list with something in it", () => {
        expect(isAnswered("Columbia")).toBe(true);
        expect(isAnswered(14)).toBe(true);
        expect(isAnswered(true)).toBe(true);
        expect(isAnswered(["W", "B"])).toBe(true);
    });

    it("is false for nothing typed, and for text that is blank", () => {
        expect(isAnswered(undefined)).toBe(false);
        expect(isAnswered(null)).toBe(false);
        expect(isAnswered("")).toBe(false);
    });

    it("is false for an unchecked box, since a box left alone and a box unchecked cannot be told apart", () => {
        expect(isAnswered(false)).toBe(false);
    });

    it("is false for a zero, since a number left alone reports one", () => {
        expect(isAnswered(0)).toBe(false);
    });

    it("is false for a list of nothing", () => {
        expect(isAnswered([])).toBe(false);
    });

    describe("an option box", () => {
        it("is answered when it has a choice", () => {
            expect(isAnswered({ description: "AUTOMOBILE", value: "01" })).toBe(true);
        });

        it("is not answered when nothing is chosen, which it reports as a blank pair", () => {
            expect(isAnswered({ description: "", value: "" })).toBe(false);
        });

        it("is not answered when its value is blank, whatever its description says", () => {
            expect(isAnswered({ description: "NONE", value: "" })).toBe(false);
        });
    });

    it("is true for an object that is not an option box", () => {
        expect(isAnswered({ city: "Columbia" })).toBe(true);
    });
});

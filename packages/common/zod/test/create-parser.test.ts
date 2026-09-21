import { describe, expect, it } from "vitest";
import * as zod from "zod";

import { createParser } from "../src/index";

const personSchema = zod.object({
    name: zod.string().min(2),
    age: zod.number().optional()
});

describe("createParser", () => {
    const parser = createParser(personSchema);

    describe("an object", () => {
        it("succeeds with the data when it matches the schema", () => {
            const result = parser.parse({ age: 30, name: "Dana" });

            expect(result).toEqual({ success: true, data: { age: 30, name: "Dana" } });
        });

        it("fails with the error when it does not, naming what was wrong", () => {
            const result = parser.parse({ name: "D" });

            expect(result.success).toBe(false);

            if (!result.success) {
                expect(result.error).toBeInstanceOf(zod.ZodError);
                expect(result.error.issues.map(issue => issue.path)).toEqual([["name"]]);
            }
        });

        it("fails with every problem it has, not only the first", () => {
            const result = parser.parse({ age: "thirty", name: "D" });

            expect(result.success).toBe(false);

            if (!result.success) {
                expect(result.error.issues.map(issue => issue.path[0]).sort()).toEqual(["age", "name"]);
            }
        });

        it("succeeds with the data as the schema shapes it, defaults and all", () => {
            const withDefault = createParser(zod.object({ role: zod.string().default("officer") }));

            expect(withDefault.parse({})).toEqual({ success: true, data: { role: "officer" } });
        });

        it("succeeds with the data as the schema transforms it", () => {
            const trimmed = createParser(zod.object({ name: zod.string().transform(value => value.trim()) }));

            expect(trimmed.parse({ name: "  Dana  " })).toEqual({ success: true, data: { name: "Dana" } });
        });
    });

    describe("a string", () => {
        it("is read as json, and succeeds with the data when that matches the schema", () => {
            expect(parser.parse('{"age":30,"name":"Dana"}')).toEqual({ success: true, data: { age: 30, name: "Dana" } });
        });

        it("is read as json, and fails when that does not match the schema", () => {
            const result = parser.parse('{"name":"D"}');

            expect(result.success).toBe(false);
        });

        it("fails when the json is not an object the schema accepts", () => {
            expect(parser.parse("42").success).toBe(false);
            expect(parser.parse("null").success).toBe(false);
            expect(parser.parse("[1,2]").success).toBe(false);
        });

        it("throws, rather than failing, when it is not json at all, with the reason as the message", () => {
            let thrown: unknown;

            try {
                parser.parse("{not json");
            } catch (error) {
                thrown = error;
            }

            expect(thrown).toBeInstanceOf(zod.ZodError);
            expect((thrown as zod.ZodError).issues).toHaveLength(1);
            expect((thrown as zod.ZodError).issues[0]).toMatchObject({ code: "custom", path: [] });
            expect((thrown as zod.ZodError).issues[0].message).toMatch(/JSON/i);
        });

        it("throws for an empty string too, which is not json", () => {
            expect(() => parser.parse("")).toThrow(zod.ZodError);
        });
    });

    it("gives each schema a parser of its own", () => {
        const numbers = createParser(zod.object({ count: zod.number() }));

        expect(numbers.parse({ count: 3 }).success).toBe(true);
        expect(parser.parse({ count: 3 }).success).toBe(false);
    });

    it("can be used again and again", () => {
        expect(parser.parse({ name: "Dana" }).success).toBe(true);
        expect(parser.parse({ name: "D" }).success).toBe(false);
        expect(parser.parse({ name: "Riley" }).success).toBe(true);
    });
});

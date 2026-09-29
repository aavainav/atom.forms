import { beforeEach, describe, expect, it } from "vitest";
import { z } from "zod";

import { LocalStorageService } from "../../src/services/local-storage";

const schema = z.object({ name: z.string() });

describe("LocalStorageService", () => {
    let service: LocalStorageService;

    beforeEach(() => {
        localStorage.clear();
        service = new LocalStorageService();
    });

    describe("read", () => {
        it("gives back undefined when nothing is stored under the key", async () => {
            expect(await service.read("missing", schema)).toBeUndefined();
        });

        it("gives back a value written earlier, validated against the schema", async () => {
            await service.write("name", { name: "Dana" }, schema);

            expect(await service.read("name", schema)).toEqual({ name: "Dana" });
        });

        it("treats a value that no longer matches the schema as absent, rather than throwing", async () => {
            localStorage.setItem("name", JSON.stringify({ name: 5 }));

            expect(await service.read("name", schema)).toBeUndefined();
        });

        it("treats a stored value that isn't even valid JSON as absent, rather than throwing", async () => {
            localStorage.setItem("name", "not json");

            expect(await service.read("name", schema)).toBeUndefined();
        });
    });

    describe("write", () => {
        it("stores the value under the key", async () => {
            await service.write("name", { name: "Dana" }, schema);

            expect(localStorage.getItem("name")).toBe(JSON.stringify({ name: "Dana" }));
        });

        it("overwrites whatever was stored under the key before", async () => {
            await service.write("name", { name: "Dana" }, schema);
            await service.write("name", { name: "Rivera" }, schema);

            expect(await service.read("name", schema)).toEqual({ name: "Rivera" });
        });

        it("throws rather than storing a value that does not match the schema", async () => {
            await expect(service.write("name", { name: 5 } as never, schema)).rejects.toThrow();
            expect(localStorage.getItem("name")).toBeNull();
        });
    });
});

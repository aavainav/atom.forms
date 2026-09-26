import { describe, expect, it } from "vitest";

import { mergeReadOnlyFields } from "../../src/mapping/merge-read-only-fields";

/** A contract with single fields and a list of pages. The list is not optional, since `ReadOnlyFields` types an optional one as a plain boolean. */
interface ITestData {
    readonly agencyName?: string;
    readonly courtName?: string;
    readonly persons: ReadonlyArray<{ readonly firstName?: string; readonly lastName?: string }>;
}

describe("mergeReadOnlyFields", () => {
    it("answers what it is given when there is nothing to lay it over", () => {
        expect(mergeReadOnlyFields<ITestData>(undefined, { agencyName: true })).toEqual({ agencyName: true });
    });

    it("keeps a field that either marks", () => {
        expect(mergeReadOnlyFields<ITestData>({ agencyName: true }, { courtName: true })).toEqual({ agencyName: true, courtName: true });
    });

    it("keeps a field marked before when the later says nothing of it, or unmarks it", () => {
        expect(mergeReadOnlyFields<ITestData>({ agencyName: true }, { agencyName: false })).toEqual({ agencyName: true });
        expect(mergeReadOnlyFields<ITestData>({ agencyName: true }, {})).toEqual({ agencyName: true });
    });

    it("marks a field the later marks that was not marked before", () => {
        expect(mergeReadOnlyFields<ITestData>({ agencyName: false }, { agencyName: true })).toEqual({ agencyName: true });
    });

    it("lays a list of pages over by position", () => {
        const merged = mergeReadOnlyFields<ITestData>({ persons: [{ firstName: true }] }, { persons: [{ lastName: true }, { firstName: true }] });

        expect(merged).toEqual({ persons: [{ firstName: true, lastName: true }, { firstName: true }] });
    });

    it("keeps the pages of the longer list", () => {
        const merged = mergeReadOnlyFields<ITestData>({ persons: [{}, { firstName: true }] }, { persons: [{ lastName: true }] });

        expect(merged.persons).toHaveLength(2);
        expect(merged.persons?.[1]).toEqual({ firstName: true });
    });

    it("leaves what it was given as it was", () => {
        const base: ReturnType<typeof mergeReadOnlyFields<ITestData>> = { agencyName: true };
        const next: ReturnType<typeof mergeReadOnlyFields<ITestData>> = { courtName: true };

        mergeReadOnlyFields(base, next);

        expect(base).toEqual({ agencyName: true });
        expect(next).toEqual({ courtName: true });
    });
});

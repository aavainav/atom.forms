import { describe, expect, it } from "vitest";

import { getStatusWatermark } from "../../src/components/watermark/watermark";

describe("getStatusWatermark", () => {
    /** The document itself rather than a copy of one: an issued citation, an approved crash report. */
    it.each(["approved", "issued"] as const)("stamps nothing on a form that is %s", (status) => {
        expect(getStatusWatermark(status)).toBeUndefined();
    });

    it.each([
        ["canceled", "CANCELED"],
        ["draft", "DRAFT"],
        ["inProgress", "IN PROGRESS"],
        ["inReview", "IN REVIEW"],
        ["rejected", "REJECTED"],
        ["voided", "VOID"]
    ] as const)("stamps a form that is %s with %s", (status, watermark) => {
        expect(getStatusWatermark(status)).toBe(watermark);
    });
});

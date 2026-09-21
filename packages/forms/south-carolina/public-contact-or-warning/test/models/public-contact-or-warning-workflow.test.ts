import { describe, expect, it } from "vitest";

import { createForm } from "../fixtures/form";

describe("the public contact or warning form", () => {
    it("has no workflow, since a contact record is neither issued nor reviewed", async () => {
        const form = await createForm();

        expect(form.workflow).toBeUndefined();
        expect(form.getTransitions()).toEqual([]);
    });

    it("leaves the workflow out of its record", async () => {
        expect((await createForm()).extractData()).not.toHaveProperty("workflow");
    });
});

import { describe, expect, it } from "vitest";

import { StringFieldModel } from "../../src/models/string-field";
import { withChanges } from "../../src/utils/clone";

/** The raw shape a `FieldModel` is constructed from. */
const spec = { label: "First name", name: "first-name", value: "" };

describe("withChanges", () => {
    it("returns a new instance and leaves the original alone", () => {
        const field = new StringFieldModel(spec);

        const changed = withChanges(field, { value: "Dana" });

        expect(changed).not.toBe(field);
        expect(changed.getValue()).toBe("Dana");
        expect(field.getValue()).toBe("");
    });

    it("keeps the original's prototype, so the clone is still its own type", () => {
        expect(withChanges(new StringFieldModel(spec), { value: "Dana" })).toBeInstanceOf(StringFieldModel);
    });

    it("carries across every property the change does not name", () => {
        const field = new StringFieldModel(spec).setIsDirty(true);

        const changed = withChanges(field, { value: "Dana" });

        expect(changed.label).toBe("First name");
        expect(changed.name).toBe("first-name");
        expect(changed.getIsDirty()).toBe(true);
    });

    /**
     * A field's uuid is the DOM id of the input rendered for it, so it must survive an edit. It is across *pages*
     * that a shared section's fields are required to differ, not across revisions of one field.
     */
    it("preserves the instance's id", () => {
        const field = new StringFieldModel(spec);

        expect(withChanges(field, { value: "Dana" }).id).toBe(field.id);
    });

    it("does nothing when a setter's result is discarded", () => {
        const field = new StringFieldModel(spec);

        field.setValue("Dana");

        expect(field.getValue()).toBe("");
    });
});

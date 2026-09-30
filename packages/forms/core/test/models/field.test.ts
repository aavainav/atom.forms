import { describe, expect, it } from "vitest";

import { BooleanFieldModel } from "../../src/models/boolean-field";
import { NumberFieldModel } from "../../src/models/number-field";
import { OptionFieldModel } from "../../src/models/option-field";
import { StringFieldModel } from "../../src/models/string-field";

/** Every concrete field overrides `value` with its own default, so the value given here is never the one that lands. */
const spec = { label: "Field", name: "field", value: "" };

describe("StringFieldModel", () => {
    it("defaults to a blank string, which reads as empty", () => {
        expect(new StringFieldModel(spec).getValue()).toBe("");
        expect(new StringFieldModel(spec).getIsEmpty()).toBe(true);
    });

    it("is not empty once it holds text", () => {
        expect(new StringFieldModel(spec).setValue("Dana").getIsEmpty()).toBe(false);
    });

    it("resets to a blank string", () => {
        expect(new StringFieldModel(spec).setValue("Dana").setDefaultValue().getValue()).toBe("");
    });
});

describe("NumberFieldModel", () => {
    it("defaults to null", () => {
        expect(new NumberFieldModel(spec).getValue()).toBeNull();
    });

    /** Only a blank is empty, so a real answer of zero is not taken for an unanswered field. */
    it("counts null as empty, and a real zero as an answer", () => {
        expect(new NumberFieldModel(spec).getIsEmpty()).toBe(true);
        expect(new NumberFieldModel(spec).setValue(0).getIsEmpty()).toBe(false);
        expect(new NumberFieldModel(spec).setValue(5).getIsEmpty()).toBe(false);
    });

    it("counts an empty array as empty", () => {
        expect(new NumberFieldModel(spec).setValue([]).getIsEmpty()).toBe(true);
        expect(new NumberFieldModel(spec).setValue([0]).getIsEmpty()).toBe(false);
    });

    it("resets to null", () => {
        expect(new NumberFieldModel(spec).setValue(5).setDefaultValue().getValue()).toBeNull();
    });
});

describe("BooleanFieldModel", () => {
    /** A checkbox uses the base `getIsEmpty`, so it is never empty when true and false reads as empty. */
    it("defaults to false, which reads as empty, and is never empty when true", () => {
        expect(new BooleanFieldModel(spec).getValue()).toBe(false);
        expect(new BooleanFieldModel(spec).getIsEmpty()).toBe(true);
        expect(new BooleanFieldModel(spec).setValue(true).getIsEmpty()).toBe(false);
    });

    it("resets to false", () => {
        expect(new BooleanFieldModel(spec).setValue(true).setDefaultValue().getValue()).toBe(false);
    });
});

describe("OptionFieldModel", () => {
    it("defaults to a blank value/description pair", () => {
        expect(new OptionFieldModel(spec).getValue()).toEqual({ value: "", description: "" });
    });

    /** An option field always holds a pair, so it is empty only when both halves are blank. */
    it("is empty only when both halves are blank", () => {
        expect(new OptionFieldModel(spec).getIsEmpty()).toBe(true);
        expect(new OptionFieldModel(spec).setValue({ value: "A", description: "" }).getIsEmpty()).toBe(false);
        expect(new OptionFieldModel(spec).setValue({ value: "", description: "Alpha" }).getIsEmpty()).toBe(false);
    });

    it("resets to a blank pair", () => {
        expect(new OptionFieldModel(spec).setValue({ value: "A", description: "Alpha" }).setDefaultValue().getValue())
            .toEqual({ value: "", description: "" });
    });
});

describe("field state", () => {
    it("defaults to enabled and without an error", () => {
        const field = new StringFieldModel(spec);

        expect(field.getIsEnabled()).toBe(true);
        expect(field.getHasError()).toBe(false);
    });

    it("returns a new field from every setter", () => {
        const field = new StringFieldModel(spec);

        expect(field.setHasError(true)).not.toBe(field);
        expect(field.setIsEnabled(false)).not.toBe(field);
        expect(field.setValue("Dana")).not.toBe(field);

        expect(field.getHasError()).toBe(false);
        expect(field.getIsEnabled()).toBe(true);
        expect(field.getValue()).toBe("");
    });

    it("gives every field its own id", () => {
        expect(new StringFieldModel(spec).id).not.toBe(new StringFieldModel(spec).id);
    });
});

describe("field model construction", () => {
    /**
     * Characterization, not specification. Every concrete field declares `value` as a class-field initializer,
     * which under `useDefineForClassFields` runs after `FieldModel`'s constructor has assigned `field.value` -- so
     * the constructor argument is overwritten by the type's own default. Production never notices, because
     * `FieldDefinition.createNew` always passes `""` and real values arrive through `setValue`, which goes through
     * `withChanges` and bypasses the constructor.
     *
     * These pin the behaviour as it stands today. A fixture must seed values with `setValue`, never a constructor.
     */
    it("discards the value it was constructed with, falling back to the type's default", () => {
        expect(new StringFieldModel({ label: "L", name: "n", value: "abc" }).getValue()).toBe("");
        expect(new NumberFieldModel({ label: "L", name: "n", value: 42 }).getValue()).toBeNull();
        expect(new BooleanFieldModel({ label: "L", name: "n", value: true }).getValue()).toBe(false);
        expect(new OptionFieldModel({ label: "L", name: "n", value: { value: "A", description: "Alpha" } }).getValue())
            .toEqual({ value: "", description: "" });
    });

    it("keeps the name and label it was constructed with", () => {
        const field = new StringFieldModel({ label: "First name", name: "first-name", value: "abc" });

        expect(field.label).toBe("First name");
        expect(field.name).toBe("first-name");
    });

    it("takes a value through setValue", () => {
        expect(new StringFieldModel(spec).setValue("abc").getValue()).toBe("abc");
    });
});

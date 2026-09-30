import { vi } from "vitest";

import { FormModel, IFormVariant } from "@forms/core";

/** The identity every report stub carries. */
export const identity = { name: "Stub Form", status: "draft", type: "none", version: "1.0" } as const;

/**
 * Every field the stub form has, left blank. A real form reports each of its fields, answered or not, and the preset
 * service leaves out a field a report does not carry, as one the form does not have.
 */
export const blankFields = { agencyCity: "", agencyName: "", agencyPhone: "", notes: "", vehicleMake: { description: "", value: "" }, vehicleYear: 0 } as const;

/** The two shapes a variant stub comes in, Court the default, as S438's do. */
export const variants: ReadonlyArray<IFormVariant> = [{ id: "court", isDefault: true, title: "Court" }, { id: "trial", title: "Trial" }];

/** What a form is asked to populate itself from. */
export interface IPopulateInput {
    readonly data: Record<string, unknown>;
    readonly readOnlyFields?: Record<string, unknown>;
}

/** What every populate is handed, so a test can say what a form was asked for. Clear it between tests. */
export const populated = vi.fn<(input: IPopulateInput) => void>();

/**
 * Stands in for a form that keeps what it is given: the panel, the preset service and the audit read only its
 * identity, its answers, its locks, and what populating it gives. It is made on the real form's prototype, so it is a
 * form without a cast. `populate` replaces what populating it does, as a test needs a slow or a failing one.
 */
export function stubForm(answers: Record<string, unknown> = {}, readOnlyFields?: Record<string, unknown>, populate?: (input: IPopulateInput) => Promise<FormModel<any>>): FormModel<any> {
    return Object.assign(Object.create(FormModel.prototype), {
        ...identity,
        answers,
        history: [],
        id: "form-1",
        mode: "editable",
        readOnlyFields,
        clean() { return this; },
        extractData: () => ({ ...identity, ...blankFields, ...answers }),
        getIsDirty: () => false,
        mapper: { extract: (source: { answers: Record<string, unknown> }) => ({ ...source.answers }) },
        variants: [],
        populate: async (input: IPopulateInput) => {
            populated(input);

            if (populate) {
                return populate(input);
            }

            const kept = Object.fromEntries(Object.entries(input.data).filter(([key]) => !(key in identity)));

            return stubForm({ ...answers, ...kept }, { ...readOnlyFields, ...input.readOnlyFields });
        }
    });
}

/** A stub form that comes in two variants, Court and Trial, and is in the one given. */
export function variantForm(current: string, answers: Record<string, unknown> = {}): FormModel<any> {
    return Object.assign(stubForm(answers), { variants, getVariant: () => current });
}

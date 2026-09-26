import { vi } from "vitest";

import { FormModel } from "@forms/core";

/** The identity every report stub carries. */
export const identity = { name: "Stub Form", status: "draft", type: "none", version: "1.0" } as const;

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
        extractData: () => ({ ...identity, ...answers }),
        getIsDirty: () => false,
        mapper: { extract: (source: { answers: Record<string, unknown> }) => ({ ...source.answers }) },
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

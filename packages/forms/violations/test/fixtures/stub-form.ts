import type { FormMode, FormModel } from "@forms/core";

import type { IViolationBinding } from "../../src/models/violation-binding";

/** What a stub form is told about itself. */
interface IStubFormOptions {
    /** The names of the page sets the form has locked. */
    readonly lockedPageSets?: ReadonlyArray<string>;
    readonly mode?: FormMode;
}

/**
 * A form that answers only what the violations package asks of one: its mode, which page definitions it has, and
 * which of those it has locked. Every stub carries the same id, so a controller treats a swap between them as the
 * same form changing, as it does when a real form is edited.
 */
export function createStubForm({ lockedPageSets = [], mode = "editable" }: IStubFormOptions = {}): FormModel<any> {
    const definitions = [{ name: "citation" }, { name: "notice" }];

    return {
        getChildDefinitions: () => definitions,
        id: "form-1",
        isPageSetLocked: (definition: { name: string }) => lockedPageSets.includes(definition.name),
        mode
    } as unknown as FormModel<any>;
}

/** A binding that lands violations on the page named "citation". */
export function createBinding(apply: IViolationBinding["apply"] = () => Promise.resolve()): IViolationBinding {
    return { apply, getApplied: () => [], listId: "list", pageName: "citation" };
}

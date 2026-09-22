import { RuleCollection } from "@forms/core";
import type { FormMode, FormModel, FormStatus, IWorkflowEntry, Rule } from "@forms/core";

export interface IStubFormOptions {
    readonly hasMapper?: boolean;
    readonly history?: ReadonlyArray<IWorkflowEntry>;
    readonly id?: string;
    readonly mode?: FormMode;
    readonly name?: string;
    readonly status?: FormStatus;
    readonly version?: string;
}

/** Stands in for a form: the audit reads only its identity, its status, its history, its mode and what its mapper extracts. */
export function stubForm(data: object = {}, options: IStubFormOptions = {}): FormModel<any> {
    const { hasMapper = true, history = [], id = "form-1", mode = "editable", name = "Stub Form", status = "draft", version = "1.0" } = options;

    return {
        history,
        id,
        mode,
        name,
        status,
        version,
        mapper: hasMapper ? { extract: () => data, populate: () => { throw new Error("not used"); } } : undefined,
        getRuleCollection: () => new RuleCollection([]),
        getPagesFor: () => [{}]
    } as unknown as FormModel<any>;
}

/** A rule that reports an issue against each of the named fields. */
export function failingRule(...fieldNames: Array<string>): Rule {
    return {
        getPageDefinition: () => ({}),
        isShared: () => true,
        validate: () => fieldNames.map(name => ({ field: { name, label: name, value: "" }, section: {}, message: "Invalid.", severity: 0 }))
    } as unknown as Rule;
}

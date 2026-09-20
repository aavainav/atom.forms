import { RuleCollection } from "@forms/core";
import type { FormModel, FormStatus, Rule } from "@forms/core";

export interface IStubFormOptions {
    readonly hasMapper?: boolean;
    readonly id?: string;
    readonly name?: string;
    readonly status?: FormStatus;
    readonly version?: string;
}

/** Stands in for a form: the audit reads only its identity, its status and what its mapper extracts. */
export function stubForm(data: object = {}, options: IStubFormOptions = {}): FormModel<any> {
    const { hasMapper = true, id = "form-1", name = "Stub Form", status = "draft", version = "1.0" } = options;

    return {
        id,
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

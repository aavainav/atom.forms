import type { FieldModel, TValueType } from "../../src/models/field";
import type { FieldDefinition } from "../../src/models/field-definition";
import type { IRuleContext } from "../../src/models/validation/rule-context";

type AnyFieldDefinition = FieldDefinition<FieldModel<TValueType>>;

/**
 * A context that answers every field lookup with the one field it was given.
 *
 * `IRuleContext` declares `form`, `page` and `getField`, but no rule and no condition reads `form` or `page` --
 * only `getField` -- so a rule can be exercised against a single field without building a form at all. The real
 * `RuleContext` needs a fully built form and is only reached through `RulesController.validate`.
 */
export function stubRuleContext(field: FieldModel<TValueType> | undefined): IRuleContext {
    return { getField: () => field } as unknown as IRuleContext;
}

/** A context that answers each lookup from the given pairs, and undefined for any definition it was not given. */
export function stubRuleContextFor(fields: ReadonlyArray<readonly [AnyFieldDefinition, FieldModel<TValueType>]>): IRuleContext {
    const map = new Map<AnyFieldDefinition, FieldModel<TValueType>>(fields);

    return { getField: (definition: AnyFieldDefinition) => map.get(definition) } as IRuleContext;
}

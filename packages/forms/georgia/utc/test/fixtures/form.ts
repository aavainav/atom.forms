import { GAUTCFormModel } from "../../src/models/utc-form";
import { GAUTCFormSchema } from "../../src/models/utc-form-schema";

/**
 * The schema is constructed once, here, at module scope.
 *
 * Constructing it is what builds the form's definition tree and registers it against the model constructors, and
 * `Entity.definitionRegistry` is keyed by constructor -- so a schema built per test would mint a second tree and
 * any model still holding the first would fail its child-definition check.
 */
new GAUTCFormSchema();

/** Builds a form with its pages created. `initialize()` must be awaited -- it is what creates the pages. */
export function createForm(): Promise<GAUTCFormModel> {
    return new GAUTCFormModel().initialize();
}

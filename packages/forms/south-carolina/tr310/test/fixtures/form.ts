import { TR310FormModel } from "../../src/models/tr310-form";
import { TR310FormSchema } from "../../src/models/tr310-form-schema";

/**
 * The schema is constructed once, here, at module scope.
 *
 * Constructing it is what builds the form's definition tree and registers it against the model constructors, and
 * `Entity.definitionRegistry` is keyed by constructor -- so a schema built per test would mint a second tree and
 * any model still holding the first would fail its child-definition check. This is the largest schema in the
 * repo, so building it once also keeps the suite quick.
 */
new TR310FormSchema();

/** Builds a form with its pages created. `initialize()` must be awaited -- it is what creates the pages. */
export function createForm(): Promise<TR310FormModel> {
    return new TR310FormModel().initialize();
}

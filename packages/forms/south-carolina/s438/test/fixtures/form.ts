import { S438FormModel } from "../../src/models/s438-form";
import { S438FormSchema } from "../../src/models/s438-form-schema";

/**
 * The schema is constructed once, here, at module scope.
 *
 * Constructing it is what builds the form's definition tree and registers it against the model constructors, and
 * `Entity.definitionRegistry` is keyed by constructor -- so a schema built per test would mint a second tree and
 * any model still holding the first would fail its child-definition check. `S438FormModel` reads the schema back
 * in a field initializer, so it has to be registered before the first model is constructed.
 */
new S438FormSchema();

/**
 * Builds a form with its pages created.
 *
 * `initialize()` must be awaited -- it is what creates the pages -- and it also stamps the date and time of
 * violation onto the form, which is why a partial record leaves those two fields already filled in.
 */
export function createForm(): Promise<S438FormModel> {
    return new S438FormModel().initialize();
}

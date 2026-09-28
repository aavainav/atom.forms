import { HiddenFieldModel } from "../models/hidden-field";
import { SectionModel } from "../models/section";

/**
 * Every id currently rendered under one of the section's own hidden fields -- empty when nothing is, which a
 * hidden field's own test should assert. Framework-agnostic, so a suite asserts on what it returns rather than this
 * calling into whatever test runner is in use.
 */
export function getRenderedHiddenFieldIds(container: ParentNode, section: SectionModel): Array<string> {
    return section.getChildDefinitions()
        .filter(definition => definition.valueType === HiddenFieldModel)
        .map(definition => section.get<HiddenFieldModel>(definition).id)
        .filter((id): id is string => !!id && !!container.querySelector(`#${CSS.escape(id)}`));
}

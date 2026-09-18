import { BooleanFieldModel, FieldDefinition, SectionModel } from "@forms/core";

/**
 * Returns a new section with `selected` checked and every other member of `group` cleared, in one update.
 *
 * The citation prints most answers as a row of boxes, and the framework has no radio/enum field type -- a group
 * of boolean fields plus this makes a printed row behave as the paper means it: exactly one box, or none. Used
 * only for groups whose options answer a single question (YES/NO, AM/PM, weather, road). Separate flags like
 * 2-LANE ROAD or the sentencing schools stay independent and are toggled directly.
 *
 * The section is immutable, so the caller must use the result.
 */
export function selectExclusive<TSection extends SectionModel>(
    section: TSection,
    group: ReadonlyArray<FieldDefinition<BooleanFieldModel>>,
    selected: FieldDefinition<BooleanFieldModel>): TSection {
    return group.reduce(
        (current, definition) => current.set(definition, current.get<BooleanFieldModel>(definition).setValue(definition === selected)),
        section);
}

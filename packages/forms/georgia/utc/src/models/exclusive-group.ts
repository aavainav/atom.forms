import { BooleanFieldModel, FieldDefinition, SectionModel } from "@forms/core";

/**
 * Returns a new section with `selected` checked and every other member of `group` cleared, in one update.
 *
 * The citation prints most of its answers as a row of boxes rather than as a coded field, and the framework has no
 * radio or enum field type to hold one - so a group of boolean fields plus this is what makes a printed row behave
 * the way the paper means it: exactly one box, or none. It is used only for groups whose options answer a single
 * question and so cannot both be true (YES/NO, AM/PM, the weather and road rows). Boxes that are separate flags -
 * 2-LANE ROAD, the commercial violation trio, the sentencing schools - are left independent and toggled directly.
 *
 * The section is immutable, so the reduce threads each cleared field through a new section and the caller must use
 * the result.
 */
export function selectExclusive<TSection extends SectionModel>(
    section: TSection,
    group: ReadonlyArray<FieldDefinition<BooleanFieldModel>>,
    selected: FieldDefinition<BooleanFieldModel>): TSection {
    return group.reduce(
        (current, definition) => current.set(definition, current.get<BooleanFieldModel>(definition).setValue(definition === selected)),
        section);
}

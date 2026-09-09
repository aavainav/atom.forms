import { ISectionBinding } from "../controllers/form-controller";
import { FieldModel, IOptionValue, TValueType } from "../models/field";
import { FieldDefinition } from "../models/field-definition";
import { OptionFieldModel } from "../models/option-field";
import { SectionModel } from "../models/section";

/**
 * Returns an onChange handler for an option field that also resets the fields hanging off it, for a select whose
 * value another select's options depend on.
 *
 * Both fields move in one update, so the form is never momentarily holding a value belonging to a parent it no
 * longer has. The change is computed from the section handed to the callback rather than one captured during
 * render, which another edit may already have replaced, and re-picking the option already chosen leaves the
 * dependents alone rather than clearing a selection the user did not touch.
 */
export function setOptionWithDependents<TSection extends SectionModel>(binding: ISectionBinding<TSection>, field: FieldDefinition<OptionFieldModel>, dependents: ReadonlyArray<FieldDefinition<FieldModel<TValueType>>>): (value: IOptionValue) => void {
    return value => binding.update(current => {
        const previous = current.get<OptionFieldModel>(field).getValue();
        const updated = current.set(field, current.get<OptionFieldModel>(field).setValue(value));

        if (value.value === previous.value) {
            return updated;
        }

        return dependents.reduce(
            (section, dependent) => section.set(dependent, section.get<FieldModel<TValueType>>(dependent).setDefaultValue()),
            updated);
    });
}
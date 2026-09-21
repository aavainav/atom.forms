/** The attribute `FFieldControl` and `FFieldCheckbox` carry on their root element, naming the field the control draws. */
const fieldIdAttribute = "data-field-id";

/** Finds the control drawing the field with the given id. */
export function getFieldControl(fieldId: string): HTMLElement | null {
    return document.querySelector<HTMLElement>(`[${fieldIdAttribute}="${fieldId.replace(/["\\]/g, "\\$&")}"]`);
}

/** The field a pointer or focus is in, from any element inside its control. */
export function getFieldId(element: Element): string | undefined {
    return element.closest<HTMLElement>(`[${fieldIdAttribute}]`)?.dataset.fieldId;
}

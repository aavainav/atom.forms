/** An option box, which holds its answer in its value: it reports a blank one when it is left alone. */
function isOptionBox(value: unknown): value is { readonly value: unknown } {
    return typeof value === "object" && value !== null && !Array.isArray(value) && "value" in value && "description" in value;
}

/**
 * Whether a field holds an answer. A box left unchecked and a number left alone report false and zero, which cannot be
 * told from an answer of no or of zero, so they count as not answered -- as does an option box with nothing chosen.
 */
export function isAnswered(value: unknown): boolean {
    if (isOptionBox(value)) {
        return isAnswered(value.value);
    }

    return !(value === undefined || value === null || value === "" || value === false || value === 0 || (Array.isArray(value) && value.length === 0));
}

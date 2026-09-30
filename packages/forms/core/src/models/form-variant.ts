/** A blank form a new report can start as, where a form comes in more than one shape. */
export interface IFormVariant {
    /** Says a little more about the variant, shown under its title. */
    readonly description?: string;
    /** Identifies the variant, and is what `applyVariant` is given. */
    readonly id: string;
    /** What the form starts as, what a record naming no variant opens as, and what a preset naming none is for. A form with variants flags exactly one. */
    readonly isDefault?: boolean;
    /** What the variant is called in the picker. */
    readonly title: string;
}

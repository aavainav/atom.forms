import { IValueListOption } from "./value-list-option";

/** Describes a value list: how it is identified, what it hangs off, and how its options are loaded. */
export interface IValueListDefinition<TOption extends IValueListOption = IValueListOption> {
    /** Identifies the list. Registering a second definition under an id already in use replaces the first. */
    readonly id: string;
    /**
     * The id of the list this one's options hang off. When set, every option `load` resolves is expected to be an
     * `IChildValueListOption`, and the list resolves to nothing until a parent value is supplied.
     */
    readonly parentId?: string;

    /** Loads every option in the list, flat; a child list loads the options of every parent at once. */
    load: () => Promise<ReadonlyArray<TOption>>;
}

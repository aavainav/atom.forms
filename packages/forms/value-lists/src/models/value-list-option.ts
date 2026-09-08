/** Represents a value/description pair. */
export interface IValueListOption {
    readonly value: string;
    readonly description: string;
}

/** An option belonging to a child list, carrying the value of the parent option it hangs off. */
export interface IChildValueListOption extends IValueListOption {
    readonly parentValue: string;
}

/** The compact row a generated list is emitted as. The parent's value is present only on a child list. */
export type ValueListRow = readonly [value: string, description: string, parentValue?: string];

/** Expands the rows a generated list is emitted as into options. */
export function toOptions(rows: ReadonlyArray<ValueListRow>): Array<IValueListOption> {
    return rows.map(([value, description, parentValue]) => parentValue === undefined
        ? { value, description }
        : { value, description, parentValue });
}

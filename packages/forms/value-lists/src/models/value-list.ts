import { IValueListDefinition } from "./value-list-definition";
import { IChildValueListOption, IValueListOption } from "./value-list-option";

const emptyOptions: ReadonlyArray<IValueListOption> = [];

/**
 * Separates the parent's value from the key it scopes on a child list's indexes.
 *
 * The codes and descriptions either side of it carry spaces, commas, quotes and slashes, so the separator has to
 * be something the data cannot contain: no value or description in any generated list carries a pipe, and the
 * generator refuses to emit a row that does.
 */
const keySeparator = "|";

/** Normalizes a description for lookup, so a name that arrived from a drop matches the list's own casing. */
function normalize(description: string): string {
    return description.trim().toLowerCase();
}

/** Holds a loaded value list and the indexes built over it. */
export class ValueList {
    private byDescription?: Map<string, IValueListOption>;
    private byParent?: Map<string, Array<IValueListOption>>;
    private byValue?: Map<string, IValueListOption>;

    constructor(readonly definition: IValueListDefinition, private readonly options: ReadonlyArray<IValueListOption>) {
    }

    /**
     * Finds the option whose description matches, ignoring case and surrounding whitespace. A child list needs
     * the parent's value: descriptions are only unique underneath a single parent - there are 7,761 vehicle
     * models but only 4,818 distinct names - so a lookup without one on a child list finds nothing rather than
     * guessing which make's model was meant.
     */
    public findByDescription(description: string, parentValue?: string): IValueListOption | undefined {
        if (!this.byDescription) {
            this.byDescription = this.buildIndex(option => normalize(option.description));
        }

        const match = normalize(description);

        return match ? this.byDescription.get(this.getIndexKey(match, parentValue)) : undefined;
    }

    /** Finds the option carrying the given code, within the parent's options when this is a child list. */
    public findByValue(value: string, parentValue?: string): IValueListOption | undefined {
        if (!this.byValue) {
            this.byValue = this.buildIndex(option => option.value);
        }

        return value ? this.byValue.get(this.getIndexKey(value, parentValue)) : undefined;
    }

    /** Gets every option, or only those hanging off `parentValue` when this is a child list. */
    public getOptions(parentValue?: string): ReadonlyArray<IValueListOption> {
        if (!this.definition.parentId) {
            return this.options;
        }

        // a child list with no parent chosen has no options at all, rather than all of them
        return parentValue ? this.getByParent().get(parentValue) ?? emptyOptions : emptyOptions;
    }

    private buildIndex(getKey: (option: IValueListOption) => string): Map<string, IValueListOption> {
        const index = new Map<string, IValueListOption>();

        for (const option of this.options) {
            // the first match wins, matching the linear search this replaces; a legacy code list carries genuine
            // duplicates - two race codes both read ASIAN OR PACIFIC ISLANDER - and the earlier one is the one a
            // search would have stopped on
            const key = this.getIndexKey(getKey(option), (<IChildValueListOption>option).parentValue);

            if (!index.has(key)) {
                index.set(key, option);
            }
        }

        return index;
    }

    private getByParent(): Map<string, Array<IValueListOption>> {
        if (!this.byParent) {
            this.byParent = new Map<string, Array<IValueListOption>>();

            for (const option of this.options) {
                const parentValue = (<IChildValueListOption>option).parentValue;

                // a child row hanging off nothing is unreachable; the generator does not emit one, and skipping
                // it here keeps a hand-registered list from quietly creating a group nothing can ask for
                if (parentValue) {
                    const group = this.byParent.get(parentValue);

                    group ? group.push(option) : this.byParent.set(parentValue, [option]);
                }
            }
        }

        return this.byParent;
    }

    private getIndexKey(key: string, parentValue?: string): string {
        return this.definition.parentId ? `${parentValue ?? ""}${keySeparator}${key}` : key;
    }
}

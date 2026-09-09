import { IViolationListDefinition } from "./violation-list-definition";
import { IViolation } from "./violation";

/** Normalizes a term for lookup, so a search matches whatever casing the code list was published in. */
function normalize(value: string): string {
    return value.trim().toLowerCase();
}

/** Holds a loaded violation list and the indexes built over it. */
export class ViolationList {
    private byCode?: Map<string, IViolation>;

    constructor(readonly definition: IViolationListDefinition, private readonly violations: ReadonlyArray<IViolation>) {
    }

    /** Finds the violation carrying the given code. */
    public findByCode(code: string): IViolation | undefined {
        if (!this.byCode) {
            this.byCode = new Map<string, IViolation>();

            for (const violation of this.violations) {
                // the first match wins, matching the linear search this replaces; a legacy code list carries
                // genuine duplicates, and the earlier one is where a search would have stopped
                if (!this.byCode.has(violation.code)) {
                    this.byCode.set(violation.code, violation);
                }
            }
        }

        return code ? this.byCode.get(code) : undefined;
    }

    /** Gets every violation in the list. */
    public getViolations(): ReadonlyArray<IViolation> {
        return this.violations;
    }

    /**
     * Finds the violations matching the given term across their code, statute and description.
     *
     * Matches whose code or statute starts with the term are ordered ahead of the rest, because an officer typing
     * a section number knows exactly which charge they are after and should not have to scroll past every
     * description that happens to mention it. An empty term matches the whole list, which is what the selector shows
     * before anything has been typed.
     */
    public search(term: string): ReadonlyArray<IViolation> {
        const match = normalize(term);
        if (!match) {
            return this.violations;
        }

        const prefixed: Array<IViolation> = [];
        const contained: Array<IViolation> = [];

        for (const violation of this.violations) {
            const code = normalize(violation.code);
            const statute = violation.statute ? normalize(violation.statute) : "";

            if (code.startsWith(match) || (statute && statute.startsWith(match))) {
                prefixed.push(violation);
            }
            else if (code.includes(match) || statute.includes(match) || normalize(violation.description).includes(match)) {
                contained.push(violation);
            }
        }

        return [...prefixed, ...contained];
    }
}

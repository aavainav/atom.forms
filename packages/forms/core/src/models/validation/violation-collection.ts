import { IRuleViolation } from "./rule-violation";

export type ViolationCollectionConstructor = new () => ViolationCollection;

/** A collection of violations. */
export interface IViolationCollection {
    readonly violations: ReadonlyArray<IRuleViolation>;

    addViolation(violation: IRuleViolation): ViolationCollection;
    getViolations(): Array<IRuleViolation>;
}

/** Represents an immutable collection of rule violations. */
export class ViolationCollection implements IViolationCollection {
    public readonly violations: ReadonlyArray<IRuleViolation>;

    constructor(violations: ReadonlyArray<IRuleViolation> = []) {
        this.violations = violations;
    }

    public addViolation(violation: IRuleViolation): ViolationCollection {
        return new ViolationCollection([...this.violations, violation]);
    }

    public getViolations(): Array<IRuleViolation> {
        return [...this.violations];
    }
}

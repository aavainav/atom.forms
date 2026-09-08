import { EventEmitter, IEvent } from "@common/event-emitter";
import { IController } from "../../controllers/controller";
import { FormModel } from "../form";
import { Rule } from "./rule";
import { RuleCollection } from "./rule-collection";
import { RuleContext } from "./rule-context";
import { ViolationCollection } from "./violation-collection";

type RuleConstructor<T> = new (...args: any[]) => T;

export interface IRulesController extends IController {
    /** The form model that this rules controller is associated with. */
    readonly form: FormModel;
    /** The collection of violations for the form. */
    readonly violationCollection: ViolationCollection;
    /** The collection of rules that help validate the form. */
    readonly ruleCollection: RuleCollection;

    /** Adds a collection of rules to this controller. */
    addRuleCollection(ruleCollection: RuleCollection): void;
    /** Gets the collection of rules. */
    getRuleCollection(): RuleCollection;
    /** Gets the rule type by name. */
    getTypeByName(name: string): RuleConstructor<Rule>;
    /** Gets the violation collection. */
    getViolationCollection(): ViolationCollection;
    /** Validates the current form against the rule collection. */
    validate(): void;
}

/**
 * A decorator function used to register a validation rule by associating a name with a rule constructor.
 * This allows the rule to be stored in the `RulesController` type registry for later retrieval.
 */
export function RegisterRule(name: string) {
    return function <T extends RuleConstructor<Rule>>(target: T) {
        RulesController.typeRegistry.set(name, target);
    };
}

/**
 * The `RulesController` class is responsible for managing validation rules and their associated violations
 * for a given form. It provides methods to validate fields, manage rule violations, and interact with
 * the form's structure.
 *
 * The form and rule collection are reassigned by the controller manager each time the controller is requested,
 * since the form model is immutable and is replaced by a new instance whenever the form is edited.
 */
export class RulesController implements IRulesController {
    public static readonly typeRegistry: Map<string, RuleConstructor<Rule>> = new Map<string, RuleConstructor<Rule>>();

    private readonly _changed = new EventEmitter<void>("rules:changed");

    form: FormModel;

    violationCollection: ViolationCollection;
    ruleCollection: RuleCollection;

    constructor(form: FormModel, ruleCollection: RuleCollection = new RuleCollection([])) {
        this.form = form;
        this.ruleCollection = ruleCollection;
        this.violationCollection = new ViolationCollection();
    }

    get onChanged(): IEvent<void> {
        return this._changed.event;
    }

    public addRuleCollection(ruleCollection: RuleCollection): void {
        this.ruleCollection = this.ruleCollection.addRuleCollection(ruleCollection);
    }

    public getRuleCollection(): RuleCollection {
        return this.ruleCollection;
    }

    public getTypeByName(name: string): RuleConstructor<Rule> {
        const type = RulesController.typeRegistry.get(name);
        if (!type) {
            throw new Error(`Rule type with name '${name}' not found in the registry.`);
        }

        return type;
    }

    public getViolationCollection(): ViolationCollection {
        return this.violationCollection;
    }

    public validate(): void {
        let violationCollection = new ViolationCollection();

        for (const rule of this.ruleCollection.getRules()) {
            // a rule is evaluated once per page instance, so a rule reading several fields always compares
            // fields from the same page rather than fields from different copies of a repeatable page.
            for (const page of this.form.getPagesFor(rule.getPageDefinition())) {
                for (const violation of rule.validate(new RuleContext(this.form, page))) {
                    violationCollection = violationCollection.addViolation(violation);
                }
            }
        }

        this.violationCollection = violationCollection;
        this._changed.emit();
    }

    public dispose(): void {
        this.violationCollection = new ViolationCollection();
    }
}

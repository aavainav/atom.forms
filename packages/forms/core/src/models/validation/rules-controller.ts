import { EventEmitter, IEvent } from "@common/event-emitter";
import { IController } from "../../controllers/controller";
import { FormModel } from "../form";
import { Rule } from "./rule";
import { RuleCollection } from "./rule-collection";
import { RuleContext } from "./rule-context";
import { RuleIssueCollection } from "./rule-issue-collection";

type RuleConstructor<T> = new (...args: any[]) => T;

export interface IRulesController extends IController {
    /** The form model that this rules controller is associated with. */
    readonly form: FormModel<any>;
    /** The collection of issues for the form. */
    readonly issueCollection: RuleIssueCollection;
    /** The collection of rules that help validate the form. */
    readonly ruleCollection: RuleCollection;

    /** Adds a collection of rules to this controller. */
    addRuleCollection(ruleCollection: RuleCollection): void;
    /** Gets the collection of rules. */
    getRuleCollection(): RuleCollection;
    /** Gets the rule type by name. */
    getTypeByName(name: string): RuleConstructor<Rule>;
    /** Gets the issue collection. */
    getIssueCollection(): RuleIssueCollection;
    /** Validates the current form against the rule collection. */
    validate(): void;
}

/** Registers a rule constructor under `name`, for lookup via `RulesController.getTypeByName`. */
export function RegisterRule(name: string) {
    return function <T extends RuleConstructor<Rule>>(target: T) {
        RulesController.typeRegistry.set(name, target);
    };
}

/**
 * Manages a form's validation rules and issues. The controller manager reassigns `form`/`ruleCollection` each
 * time this is requested, since the form model is immutable and replaced by a new instance on every edit.
 */
export class RulesController implements IRulesController {
    public static readonly typeRegistry: Map<string, RuleConstructor<Rule>> = new Map<string, RuleConstructor<Rule>>();

    private readonly _changed = new EventEmitter<void>("rules:changed");

    form: FormModel<any>;

    issueCollection: RuleIssueCollection;
    ruleCollection: RuleCollection;

    constructor(form: FormModel<any>, ruleCollection: RuleCollection = new RuleCollection([])) {
        this.form = form;
        this.ruleCollection = ruleCollection;
        this.issueCollection = new RuleIssueCollection();
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

    public getIssueCollection(): RuleIssueCollection {
        return this.issueCollection;
    }

    public validate(): void {
        let issueCollection = new RuleIssueCollection();

        for (const rule of this.ruleCollection.getRules()) {
            const pages = this.form.getPagesFor(rule.getPageDefinition());

            // a rule is evaluated once per page instance, so a rule reading several fields always compares
            // fields from the same page rather than fields from different copies of a repeatable page. a rule
            // reading only shared sections is the exception: every page holds the same values there, so evaluating
            // it per page would report the same issue once for each of them.
            for (const page of rule.isShared() ? pages.slice(0, 1) : pages) {
                for (const issue of rule.validate(new RuleContext(this.form, page))) {
                    issueCollection = issueCollection.addIssue(issue);
                }
            }
        }

        this.issueCollection = issueCollection;
        this._changed.emit();
    }

    public dispose(): void {
        this.issueCollection = new RuleIssueCollection();
    }
}

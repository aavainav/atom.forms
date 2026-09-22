import { EventEmitter, IEvent } from "@common/event-emitter";
import { createService, Singleton } from "@shrub/core";
import { IControllerManager, IRuleIssue, RuleIssueCollection } from "@forms/core";

export const IValidationService = createService<IValidationService>("report-viewer-validation-service");

/** Defines a service for validating a report and broadcasting the results. */
export interface IValidationService {
    /** An event that is raised when a report has been validated. */
    readonly onShowIssues: IEvent<ReadonlyArray<IRuleIssue>>;

    /** Shows the specified issues. */
    showIssues(issues: ReadonlyArray<IRuleIssue>): void;
    /** Validates the form the controllers hold, shows what was found and marks the failing fields on the form, then returns what was found. */
    validate(controllers: IControllerManager): RuleIssueCollection;
}

@Singleton
export class ValidationService implements IValidationService {
    private readonly _showIssues = new EventEmitter<ReadonlyArray<IRuleIssue>>("show-issues");

    get onShowIssues(): IEvent<ReadonlyArray<IRuleIssue>> {
        return this._showIssues.event;
    }

    showIssues(issues: ReadonlyArray<IRuleIssue>): void {
        this._showIssues.emit(issues);
    }

    validate(controllers: IControllerManager): RuleIssueCollection {
        // the rules controller is cached by the manager and reads the current form, so its issues survive edits
        const rulesController = controllers.getRulesController();
        rulesController.validate();

        const issueCollection = rulesController.getIssueCollection();
        this.showIssues(issueCollection.getIssues());

        controllers.getFormController().update(form => form.validate(issueCollection));

        return issueCollection;
    }
}

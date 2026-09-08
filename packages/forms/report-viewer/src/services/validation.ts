import { EventEmitter, IEvent } from "@common/event-emitter";
import { createService, Singleton } from "@shrub/core";
import { IRuleIssue } from "@forms/core";

export const IValidationService = createService<IValidationService>("report-viewer-validation-service");

/** Defines a service for broadcasting the results of validating a report. */
export interface IValidationService {
    /** An event that is raised when a report has been validated. */
    readonly onShowIssues: IEvent<ReadonlyArray<IRuleIssue>>;

    /** Shows the specified issues. */
    showIssues(issues: ReadonlyArray<IRuleIssue>): void;
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
}

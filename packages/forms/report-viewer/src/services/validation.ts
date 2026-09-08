import { EventEmitter, IEvent } from "@common/event-emitter";
import { createService, Singleton } from "@shrub/core";
import { IRuleViolation } from "@forms/core";

export const IValidationService = createService<IValidationService>("report-viewer-validation-service");

/** Defines a service for broadcasting the results of validating a report. */
export interface IValidationService {
    /** An event that is raised when a report has been validated. */
    readonly onShowViolations: IEvent<ReadonlyArray<IRuleViolation>>;

    /** Shows the specified violations. */
    showViolations(violations: ReadonlyArray<IRuleViolation>): void;
}

@Singleton
export class ValidationService implements IValidationService {
    private readonly _showViolations = new EventEmitter<ReadonlyArray<IRuleViolation>>("show-violations");

    get onShowViolations(): IEvent<ReadonlyArray<IRuleViolation>> {
        return this._showViolations.event;
    }

    showViolations(violations: ReadonlyArray<IRuleViolation>): void {
        this._showViolations.emit(violations);
    }
}
